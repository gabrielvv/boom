from mailjet_rest import Client
from config import Config


# https://dev.mailjet.com/email/reference/send-emails/#v3_1_post_send
def send_email(email, result_url):
    mailjet = Client(
        auth=(Config.MAIL_API_KEY, Config.MAIL_API_SECRET), version='v3.1')
    text_part = f'Vous trouverez les pistes audio à cette adresse: '
    text_part += result_url
    html_part = f'<a>Vous trouverez les pistes audio '
    html_part += f'<a href="{result_url}">ici</a>'
    data = {
        'Messages': [
            {
                "From": {
                    "Name": Config.MAIL_SENDER_NAME,
                    "Email": Config.MAIL_SENDER_ADDRESS
                },
                "To": [
                    {
                        "Email": email
                    }
                ],
                "Subject": "[Boom] vos pistes audio sont prêtes",
                "TextPart": text_part,
                "HTMLPart": html_part,
                "CustomID": "BoomProcessingResult"
            }
        ]
    }
    return mailjet.send.create(data=data)


if __name__ == "__main__":
    result = send_email(Config.MAIL_SENDER_ADDRESS, 'test')
    print(result.status_code)
    print(result.json())
