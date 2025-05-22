const {Translate} = require('@google-cloud/translate').v2;
const path = require('path');
const fs = require('fs');

// Log the credentials path
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log('Credentials path:', credentialsPath);

// Check if file exists
try {
    if (fs.existsSync(credentialsPath)) {
        console.log('Credentials file exists at:', credentialsPath);
        // Read and log first few characters of the file (safely)
        const fileContent = fs.readFileSync(credentialsPath, 'utf8');
        console.log('Credentials file content preview:', fileContent.substring(0, 100) + '...');
    } else {
        console.error('Credentials file does not exist at:', credentialsPath);
    }
} catch (error) {
    console.error('Error checking credentials file:', error);
}

const translate = new Translate({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const translateText = async (text, targetLanguage) => {
    try {
        console.log('=== Google Translation Start ===');
        console.log('Input:', { text, targetLanguage });
        console.log('Using project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID);
        
        if (!text || !targetLanguage) {
            console.error('Missing required parameters:', { text, targetLanguage });
            return text;
        }

        console.log('Calling Google Translate API...');
        const [translation] = await translate.translate(text, targetLanguage);
        console.log('Google Translation response:', translation);
        
        if (!translation) {
            console.error('No translation received from Google Translate API');
            return text;
        }

        console.log('=== Google Translation End ===');
        return translation;
    } catch (error) {
        console.error('=== Google Translation Error ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        // Return original text if translation fails
        return text;
    }
};

module.exports = { translateText }; 