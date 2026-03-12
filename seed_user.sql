IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'test@example.com')
BEGIN
    INSERT INTO Users (Name, Email, PasswordHash, Role)
    VALUES ('Test User', 'test@example.com', 'password123', 'student');
    PRINT 'Test user created successfully.';
END
ELSE
BEGIN
    PRINT 'Test user already exists.';
END
GO
