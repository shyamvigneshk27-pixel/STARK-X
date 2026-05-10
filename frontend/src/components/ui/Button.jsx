import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-brand-pink-dark text-white shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 hover:-translate-y-0.5 focus:ring-brand-pink-dark",
    secondary: "bg-pink-50 text-brand-pink-dark hover:bg-pink-100 focus:ring-brand-pink",
    outline: "border-2 border-brand-pink-dark text-brand-pink-dark hover:bg-pink-50 focus:ring-brand-pink-dark"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
