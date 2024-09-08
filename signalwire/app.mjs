import https from 'https';
import querystring from 'node:querystring';

export const lambdaHandler = async (event, context) => {
    try {
        console.log(event);

        const body = querystring.parse(event.body);

        const fromNumber = body.From;
        const toNumber = body.To;

        const postData = querystring.stringify({
            token: process.env.PUSHOVER_API_TOKEN,
            user: process.env.PUSHOVER_USER_TOKEN,
            title: `Received SMS from ${fromNumber} to ${toNumber}`,
            message: body.Body,
        });

        const options = {
            hostname: 'api.pushover.net',
            port: 443,
            path: '/1/messages.json',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': postData.length,
            },
        };

        await new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                res.on('data', () => {});
                res.on('end', resolve);
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        return {
            statusCode: 200,
            body: JSON.stringify('Pushover notification sent successfully!'),
        };

    } catch (error) {
        console.error('Error sending Pushover notification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Failed to send Pushover notification.'),
        };
    }
};
