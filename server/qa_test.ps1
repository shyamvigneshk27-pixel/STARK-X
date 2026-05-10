$baseUrl = "http://localhost:4000/api"
$passCount = 0
$failCount = 0
$report = [System.Collections.Generic.List[string]]::new()

function Show-Result {
    param([int]$num, [string]$name, [bool]$passed, [string]$detail = "")
    $icon = if ($passed) { "PASS" } else { "FAIL" }
    $report.Add("[$icon] Step $num - $name")
    if ($passed) { $script:passCount++ } else { $script:failCount++ }
    Write-Host ""
    Write-Host "----------------------------------------------------"
    Write-Host "  Step $num : $name"
    if ($passed) {
        Write-Host "  Status  : [PASS]"
    } else {
        Write-Host "  Status  : [FAIL]"
    }
    if ($detail) { Write-Host "  Detail  : $detail" }
    Write-Host "----------------------------------------------------"
}

# ─────────────────────────────────────────────────────
# STEP 1: Register
# ─────────────────────────────────────────────────────
$randomSuffix = [DateTime]::Now.Ticks
$testEmail = "test_$randomSuffix@traveloop.com"
Write-Host "`nSTEP 1: POST /api/auth/register"
$regBody = '{"name":"Test User","email":"' + $testEmail + '","password":"Test@1234"}'
try {
    $r1 = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/register" -Body $regBody -ContentType "application/json"
    $token1 = $r1.token
    $userId1 = $r1.user.id
    $ok1 = ($r1.token.Length -gt 50) -and ($r1.user.email -eq $testEmail)
    Write-Host "  => user.email=$($r1.user.email), token_len=$($token1.Length)"
    Show-Result 1 "Register New User" $ok1 "email=$($r1.user.email), isAdmin=$($r1.user.isAdmin)"
} catch {
    Show-Result 1 "Register New User" $false "EXCEPTION: $($_.Exception.Message)"
    Write-Host "FATAL: Cannot continue without auth."; exit 1
}

# ─────────────────────────────────────────────────────
# STEP 2: Login
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 2: POST /api/auth/login"
$loginBody = '{"email":"' + $testEmail + '","password":"Test@1234"}'
try {
    $r2 = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/login" -Body $loginBody -ContentType "application/json"
    $token = $r2.token
    $ok2 = $token.Length -gt 50
    Write-Host "  => JWT token length = $($token.Length), isAdmin = $($r2.user.isAdmin)"
    Show-Result 2 "Login + JWT Returned" $ok2 "token_length=$($token.Length)"
} catch {
    Show-Result 2 "Login + JWT Returned" $false "EXCEPTION: $($_.Exception.Message)"
    Write-Host "FATAL: Cannot continue without token."; exit 1
}
$h1 = @{ Authorization = "Bearer $token" }

# ─────────────────────────────────────────────────────
# STEP 3: Create Trip
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 3: POST /api/trips"
$tripBody = '{"name":"Japan Adventure","startDate":"2025-09-01","endDate":"2025-09-10","totalBudget":2500}'
try {
    $r3 = Invoke-RestMethod -Method POST -Uri "$baseUrl/trips" -Body $tripBody -ContentType "application/json" -Headers $h1
    $tripId = $r3.id
    $ok3 = $tripId -and ($r3.name -eq "Japan Adventure") -and ($r3.totalBudget -eq 2500)
    Write-Host "  => id=$tripId, name=$($r3.name), budget=$($r3.totalBudget)"
    Show-Result 3 "Create Trip" $ok3 "tripId=$tripId, budget=$($r3.totalBudget)"
} catch {
    Show-Result 3 "Create Trip" $false "EXCEPTION: $($_.Exception.Message)"
    Write-Host "FATAL: Cannot continue without tripId."; exit 1
}

# ─────────────────────────────────────────────────────
# STEP 4: POST /api/aria/plan (SSE streaming)
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 4: POST /api/aria/plan (SSE streaming)"
Write-Host "  NOTE: Anthropic API key is placeholder - testing SSE infrastructure only"

$ariaBodyStr = "{`"tripId`":`"$tripId`",`"message`":`"10 days in Japan. I love street food and temples. Visit Tokyo, Kyoto, Osaka.`",`"history`":[]}"

Add-Type -AssemblyName System.Net.Http
$httpClient = [System.Net.Http.HttpClient]::new()
$httpClient.Timeout = [System.TimeSpan]::FromSeconds(15)

$req = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Post, "$baseUrl/aria/plan")
$req.Headers.Add("Authorization", "Bearer $token")
$req.Content = [System.Net.Http.StringContent]::new($ariaBodyStr, [System.Text.Encoding]::UTF8, "application/json")

$gotData = $false; $gotChunk = $false; $gotError = $false; $gotDone = $false; $gotSaved = $false
try {
    $resp = $httpClient.SendAsync($req, [System.Net.Http.HttpCompletionOption]::ResponseHeadersRead).GetAwaiter().GetResult()
    $stream = $resp.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
    $reader = [System.IO.StreamReader]::new($stream)
    
    $deadline = [DateTime]::Now.AddSeconds(12)
    while (-not $reader.EndOfStream -and ([DateTime]::Now -lt $deadline)) {
        $line = $reader.ReadLine()
        if ($line -match "^data: ") {
            $gotData = $true
            $raw = $line.Substring(6)
            if ($raw -eq "[DONE]") { $gotDone = $true; break }
            try {
                $parsed = $raw | ConvertFrom-Json
                if ($parsed.type -eq "chunk")           { $gotChunk = $true }
                if ($parsed.type -eq "itinerary_saved") { $gotSaved = $true }
                if ($parsed.type -eq "error") {
                    $gotError = $true
                    Write-Host "  [SSE error received]: $($parsed.content)"
                }
            } catch {}
        }
    }
    $reader.Close()
    $stream.Close()
    Write-Host "  => SSE got_data=$gotData, chunk=$gotChunk, saved=$gotSaved, error=$gotError, done=$gotDone"
    # SSE infra PASSES if we received data lines and a [DONE] (error is expected with fake key)
    $ok4 = $gotData -and ($gotDone -or $gotError)
    Show-Result 4 "ARIA SSE Stream (infra)" $ok4 "got_data=$gotData, error=$gotError, done=$gotDone"
} catch {
    Show-Result 4 "ARIA SSE Stream (infra)" $false "EXCEPTION: $($_.Exception.Message)"
}
$httpClient.Dispose()

# ─────────────────────────────────────────────────────
# Seed stop + activities for budget/map tests
# ─────────────────────────────────────────────────────
Write-Host "`n[Setup] Searching cities to seed stops..."
try {
    $cities = Invoke-RestMethod -Method GET -Uri "$baseUrl/cities?q=Tokyo"
    if ($cities.Count -gt 0) {
        $cityId = $cities[0].id
        Write-Host "  Found Tokyo cityId=$cityId"
        $stopBodyStr = "{`"tripId`":`"$tripId`",`"cityId`":`"$cityId`",`"arrivalDate`":`"2025-09-01`",`"departureDate`":`"2025-09-04`",`"order`":0}"
        $s1 = Invoke-RestMethod -Method POST -Uri "$baseUrl/stops" -Body $stopBodyStr -ContentType "application/json" -Headers $h1
        $stopId = $s1.id
        Write-Host "  Created stop $stopId"
        
        $a1 = Invoke-RestMethod -Method POST -Uri "$baseUrl/activities" -Body "{`"stopId`":`"$stopId`",`"name`":`"Tsukiji Fish Market`",`"type`":`"food`",`"estimatedCost`":45,`"durationHrs`":2,`"startTime`":`"09:00`"}" -ContentType "application/json" -Headers $h1
        $a2 = Invoke-RestMethod -Method POST -Uri "$baseUrl/activities" -Body "{`"stopId`":`"$stopId`",`"name`":`"Senso-ji Temple`",`"type`":`"culture`",`"estimatedCost`":0,`"durationHrs`":2,`"startTime`":`"13:00`"}" -ContentType "application/json" -Headers $h1
        Write-Host "  Created 2 activities"
    } else {
        Write-Host "  WARNING: No cities found - seed may not have run. Steps 5/6 may fail."
    }
} catch {
    Write-Host "  SETUP ERROR: $($_.Exception.Message)"
}

# ─────────────────────────────────────────────────────
# STEP 5: GET /api/trips/:id
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 5: GET /api/trips/$tripId"
try {
    $r5 = Invoke-RestMethod -Method GET -Uri "$baseUrl/trips/$tripId" -Headers $h1
    $stops = $r5.stops
    $ok5 = $stops.Count -gt 0 -and $stops[0].city -ne $null -and $stops[0].activities.Count -gt 0
    Write-Host "  => name=$($r5.name), stops=$($stops.Count), acts=$($stops[0].activities.Count)"
    Show-Result 5 "GET Trip Stops+Activities" $ok5 "stops=$($stops.Count), activities=$($stops[0].activities.Count)"
} catch {
    Show-Result 5 "GET Trip Stops+Activities" $false "EXCEPTION: $($_.Exception.Message)"
}

# ─────────────────────────────────────────────────────
# STEP 6: GET /api/budget/:tripId
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 6: GET /api/budget/$tripId"
try {
    $r6 = Invoke-RestMethod -Method GET -Uri "$baseUrl/budget/$tripId" -Headers $h1
    $ok6 = ($r6.grandTotal -gt 0) -and ($r6.byCategory.Count -gt 0) -and ($r6.byStop.Count -gt 0)
    Write-Host "  => grandTotal=$($r6.grandTotal), budget=$($r6.budget), remaining=$($r6.remaining), byCategory=$($r6.byCategory.Count), byStop=$($r6.byStop.Count), avgPerDay=$($r6.avgPerDay)"
    Show-Result 6 "GET Budget Data" $ok6 "grandTotal=$($r6.grandTotal), byCategory=$($r6.byCategory.Count)"
} catch {
    Show-Result 6 "GET Budget Data" $false "EXCEPTION: $($_.Exception.Message)"
}

# ─────────────────────────────────────────────────────
# STEP 7: PATCH /api/share/:tripId/toggle
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 7: PATCH /api/share/$tripId/toggle"
try {
    $r7 = Invoke-RestMethod -Method PATCH -Uri "$baseUrl/share/$tripId/toggle" -Headers $h1
    $shareId = $r7.shareId
    $ok7 = ($r7.isPublic -eq $true) -and ($shareId.Length -gt 10)
    Write-Host "  => isPublic=$($r7.isPublic), shareId=$shareId"
    Show-Result 7 "Toggle Trip Public" $ok7 "isPublic=$($r7.isPublic), shareId=$shareId"
} catch {
    Show-Result 7 "Toggle Trip Public" $false "EXCEPTION: $($_.Exception.Message)"
    $shareId = $null
}

# ─────────────────────────────────────────────────────
# STEP 8: GET /api/share/:shareId (NO AUTH)
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 8: GET /api/share/$shareId (no auth)"
if ($shareId) {
    try {
        $r8 = Invoke-RestMethod -Method GET -Uri "$baseUrl/share/$shareId"
        $ok8 = ($r8.id -eq $tripId) -and ($r8.isPublic -eq $true)
        Write-Host "  => id=$($r8.id), name=$($r8.name), isPublic=$($r8.isPublic), stops=$($r8.stops.Count)"
        Show-Result 8 "Read Public Trip (no auth)" $ok8 "id=$($r8.id), stops=$($r8.stops.Count)"
    } catch {
        Show-Result 8 "Read Public Trip (no auth)" $false "EXCEPTION: $($_.Exception.Message)"
    }
} else {
    Show-Result 8 "Read Public Trip (no auth)" $false "SKIPPED - shareId missing from step 7"
}

# ─────────────────────────────────────────────────────
# STEP 9: POST /api/share/:shareId/copy (as user2)
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 9: Register user2 + POST /api/share/$shareId/copy"
$user2Email = "user2_$randomSuffix@traveloop.com"
try {
    $r2reg = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/register" -Body ('{"name":"Second User","email":"' + $user2Email + '","password":"Test@1234"}') -ContentType "application/json"
    $h2 = @{ Authorization = "Bearer $($r2reg.token)" }
    Write-Host "  Registered user2: $($r2reg.user.email)"
    
    if ($shareId) {
        $r9 = Invoke-RestMethod -Method POST -Uri "$baseUrl/share/$shareId/copy" -Headers $h2
        $ok9 = $r9.newTripId -and ($r9.newTripId -ne $tripId)
        Write-Host "  => newTripId=$($r9.newTripId)"
        Show-Result 9 "Copy Public Trip as User2" $ok9 "newTripId=$($r9.newTripId)"
    } else {
        Show-Result 9 "Copy Public Trip as User2" $false "SKIPPED - shareId missing"
    }
} catch {
    Show-Result 9 "Copy Public Trip as User2" $false "EXCEPTION: $($_.Exception.Message)"
}

# ─────────────────────────────────────────────────────
# STEP 10: GET /api/admin/stats (as isAdmin user)
# ─────────────────────────────────────────────────────
Write-Host "`nSTEP 10: Create admin user, GET /api/admin/stats"
try {
    $adminOut = npx ts-node --transpile-only create_admin.ts 2>&1
    Write-Host "  Admin setup: $adminOut"
    
    $adminLogin = Invoke-RestMethod -Method POST -Uri "$baseUrl/auth/login" -Body '{"email":"admin@traveloop.com","password":"Admin@1234"}' -ContentType "application/json"
    $hAdmin = @{ Authorization = "Bearer $($adminLogin.token)" }
    Write-Host "  Admin login: isAdmin=$($adminLogin.user.isAdmin)"
    
    $r10 = Invoke-RestMethod -Method GET -Uri "$baseUrl/admin/stats" -Headers $hAdmin
    $ok10 = ($r10.totalUsers -gt 0) -and ($null -ne $r10.totalTrips) -and ($null -ne $r10.topCities)
    Write-Host "  => totalUsers=$($r10.totalUsers), totalTrips=$($r10.totalTrips), topCities=$($r10.topCities.Count), tripsPerDay=$($r10.tripsPerDay.Count)"
    Show-Result 10 "Admin Stats" $ok10 "users=$($r10.totalUsers), trips=$($r10.totalTrips), topCities=$($r10.topCities.Count)"
} catch {
    Show-Result 10 "Admin Stats" $false "EXCEPTION: $($_.Exception.Message)"
}

# FINAL REPORT
Write-Host ""
Write-Host "======================================================"
Write-Host "       TRAVELOOP END-TO-END QA RESULTS"
Write-Host "======================================================"
foreach ($line in $report) {
    Write-Host "  $line"
}
Write-Host "------------------------------------------------------"
$total = $passCount + $failCount
Write-Host "  PASSED: $passCount / $total"
Write-Host "======================================================"
