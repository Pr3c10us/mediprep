export const generateRandomPassword = (): string => {
    const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const specialCharacters = "!@#$%^&*";

    const allCharacters =
        lowerCaseLetters + upperCaseLetters + digits + specialCharacters;

    // Function to get a random character from a string
    const getRandomChar = (chars: string) =>
        chars[Math.floor(Math.random() * chars.length)];

    // Ensure the password has at least one character from each required set
    let password = [
        getRandomChar(lowerCaseLetters),
        getRandomChar(upperCaseLetters),
        getRandomChar(digits),
        getRandomChar(specialCharacters),
    ];

    // Fill the rest of the password length (min length 8) with random characters from all sets
    for (let i = 4; i < 8; i++) {
        password.push(getRandomChar(allCharacters));
    }

    // Shuffle the password array to ensure randomness
    password = password.sort(() => Math.random() - 0.5);

    // Join the password array into a string
    return password.join("");
};
