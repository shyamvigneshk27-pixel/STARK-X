-- Create Profiles table (linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  profile_photo TEXT,
  location TEXT,
  countries_visited INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Trips table
CREATE TABLE trips (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'upcoming', -- 'ongoing', 'upcoming', 'past'
  budget_limit DECIMAL DEFAULT 0,
  cover_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Activities table (Physical Activity side of Itinerary)
CREATE TABLE activities (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT REFERENCES trips ON DELETE CASCADE NOT NULL,
  day TEXT,
  time TEXT,
  title TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Expenses table
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  trip_id BIGINT REFERENCES trips ON DELETE CASCADE NOT NULL,
  activity_id BIGINT REFERENCES activities ON DELETE SET NULL, -- Optional link to an activity
  category TEXT,
  description TEXT,
  amount DECIMAL DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Community Posts table
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Simplified for demo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow users to see and edit their own data
CREATE POLICY "Users can view their own profiles" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own trips" ON trips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trips" ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trips" ON trips FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view activities for their trips" ON activities FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = activities.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can insert activities for their trips" ON activities FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM trips WHERE trips.id = activities.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Users can view expenses for their trips" ON expenses FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can insert expenses for their trips" ON expenses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Anyone can view community posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
