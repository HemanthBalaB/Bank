# Add Employee Login to Your Spring Backend

The error `No static resource api/employees/login` happens because **there is no `POST /api/employees/login` endpoint** in your backend. Your `EmployeeController` has `/register`, `/all`, `/session-check`, etc., but no `/login`.

Add the following to your backend.

---

## 1. EmployeeController.java

Add this method inside `EmployeeController` (same class that has `@RequestMapping("/api/employees")`):

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
    String username = body.get("username");  // or "email" if front sends email
    String password = body.get("password");
    if (username == null || password == null) {
        return ResponseEntity.badRequest().body(Map.of("message", "username and password required"));
    }
    Employee emp = employeeService.login(username, password);
    if (emp == null) {
        return ResponseEntity.status(401).body(Map.of("message", "Invalid employee credentials."));
    }
    return ResponseEntity.ok(Map.of(
        "message", "Login successful",
        "employeeId", emp.getEmployeeId(),
        "name", emp.getName(),
        "email", emp.getEmail()
    ));
}
```

---

## 2. EmployeeService interface

Add to your `EmployeeService` interface:

```java
Employee login(String usernameOrEmail, String password);
```

---

## 3. EmployeeServiceImpl (or your implementation class)

Implement the method. Adjust to match your `Employee` entity (field names, password encoding).

**If you store plain text password (not recommended for production):**

```java
@Override
public Employee login(String usernameOrEmail, String password) {
    Employee emp = employeeRepository.findByEmail(usernameOrEmail)
        .orElse(null);
    if (emp == null || !password.equals(emp.getPassword())) {
        return null;
    }
    return emp;
}
```

**If you use BCrypt (recommended):**

```java
@Autowired
private PasswordEncoder passwordEncoder;

@Override
public Employee login(String usernameOrEmail, String password) {
    Employee emp = employeeRepository.findByEmail(usernameOrEmail)
        .orElse(null);
    if (emp == null || !passwordEncoder.matches(password, emp.getPassword())) {
        return null;
    }
    return emp;
}
```

---

## 4. EmployeeRepository

Ensure you can find by email:

```java
Optional<Employee> findByEmail(String email);
```

---

## 5. Spring Security (if you use it)

If `/api/employees/login` is blocked by Spring Security, permit it:

```java
.requestMatchers("/api/employees/login").permitAll()
```

Restart the backend and try employee login again from the React app.

---

## 6. Keeping the employee logged in (fix redirect back to login)

After login, the React app calls `GET /api/employees/session-check`. If that request is not authenticated, the backend returns 401 and the frontend redirects to the login page. You must either **use a session cookie** or **return a token** from login.

### Option A: Use HTTP session (minimal change)

In your **login** method, put the employee in the session so the next request (session-check) is recognized:

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
    String username = body.get("username");
    String password = body.get("password");
    if (username == null || password == null) {
        return ResponseEntity.badRequest().body(Map.of("message", "username and password required"));
    }
    Employee emp = employeeService.login(username, password);
    if (emp == null) {
        return ResponseEntity.status(401).body(Map.of("message", "Invalid employee credentials."));
    }
    request.getSession().setAttribute("employee", emp);   // ← add this line
    return ResponseEntity.ok(Map.of(
        "message", "Login successful",
        "employeeId", emp.getEmployeeId(),
        "name", emp.getName(),
        "email", emp.getEmail()
    ));
}
```

Update **session-check** to read from the session and return 401 if there is no employee:

```java
@GetMapping("/session-check")
public ResponseEntity<?> sessionCheck(HttpServletRequest request) {
    Employee emp = (Employee) request.getSession().getAttribute("employee");
    if (emp == null) {
        return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
    }
    return ResponseEntity.ok(Map.of(
        "name", emp.getName(),
        "email", emp.getEmail(),
        "employeeId", emp.getEmployeeId()
    ));
}
```

**Add this import at the top of `EmployeeController.java`:**

- **Spring Boot 3** (Jakarta):  
  `import jakarta.servlet.http.HttpServletRequest;`
- **Spring Boot 2** (older):  
  `import javax.servlet.http.HttpServletRequest;`

If your IDE still says "request cannot be resolved", use the same package as your other servlet imports (e.g. `HttpServlet`) or check that `jakarta.servlet-api` / `javax.servlet-api` is on the classpath (it usually is with Spring Web).

**Spring Security:** If `/api/employees/**` is secured, either permit `session-check` or configure session-based auth for employee. You can permit only the login endpoint and leave session-check to rely on the session cookie set at login.

### Option B: Return a token and validate it

In the **login** response, return a token (e.g. JWT or opaque token). The React app stores it and sends it in the `Authorization` header for all `/api/employees/*` requests. Your backend then validates that token for `session-check` and other employee endpoints. The frontend already supports this: if the login response contains `"token": "..."`, it will be stored and sent automatically.
