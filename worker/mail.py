# using SendGrid's Python Library
# https://github.com/sendgrid/sendgrid-python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config import Config


def send_email(to_email, files):
    html_content = '<strong>Et voilà le résultat:' + files.__str__() + '</strong>'
    message = Mail(
        from_email='from_email@example.com',
        to_emails=to_email,
        subject='boom!',
        html_content=html_content)
    try:
        sg = SendGridAPIClient(Config.SENDGRID_API_KEY)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e)

# import smtplib
# from email.message import EmailMessage


# def send_email(recipient):
#     # Create a text/plain message
#     msg = EmailMessage()
#     msg.set_content('Tu trouveras le résultat ici:')

#     msg['Subject'] = f'boom!'
#     msg['From'] = 'from@example.com'
#     msg['To'] = recipient

#     # Send the message via our own SMTP server.
#     s = smtplib.SMTP('localhost')
#     s.send_message(msg)
#     s.quit()
