from mailjet_rest import Client
from config import Config
import logging


def send_email(email, result_url):
    """
    see https://dev.mailjet.com/email/reference/send-emails/#v3_1_post_send
    """
    logging.info('send_email email=%s result_url=%s', email, result_url)
    mailjet = Client(
        auth=(Config.MAIL_API_KEY, Config.MAIL_API_SECRET), version='v3.1')
    data = {
        "Messages": [
            {
                "From": {
                    "Email": Config.MAIL_SENDER_ADDRESS,
                    "Name": Config.MAIL_SENDER_NAME
                },
                "To": [
                    {
                        "Email": email,
                    }
                ],
                "TemplateID": Config.MAIL_TEMPLATE_ID,
                "TemplateLanguage": True,
                "Subject": "Your audio tracks are ready",
                "Variables": {
                    "result_link": result_url
                }
            }
        ]
    }
    return mailjet.send.create(data=data)


if __name__ == "__main__":
    result = send_email(Config.MAIL_SENDER_ADDRESS, 'test')
    print(result.status_code)
    print(result.json())
