export function modesFunction(isDarkMode, setIsDarkMode) {
    setIsDarkMode(!isDarkMode);
}

export const languageSetFunction = (currentLanguage, setLanguage) => {
    setLanguage(currentLanguage === "EN" ? "HU" : "EN");
};