import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Mailgun from 'mailgun.js';

@Injectable()
export class UtilityService {
    constructor(private readonly config: ConfigService) { }

    private MAILGUN_KEY = this.config.get('MAILGUN_KEY');
    private MAILGUN_DOMAIN = this.config.get('MAILGUN_DOMAINE');
    private client = new Mailgun(FormData).client({
        username: 'api',
        key: this.MAILGUN_KEY,
    });
    /**
     * Send via API
     *
     * @param data
     */
    async sendMail(data: { from: string; to: string; subject: string; text: string }) {


        const mailData = {
            from: data.from,
            to: data.to,
            subject: data.subject,
            text: data.text,

        };

        try {
            const response = await this.client.messages.create(this.MAILGUN_DOMAIN, mailData);
            console.log('Email sent successfully:', response);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }

    }

    async postWithHeader(uri, data, contentType, authorization) {

        try {
            const request = await axios.post(uri, data, {
                headers: {
                    'Content-Type': contentType,
                    'Authorization': authorization
                }
            });
            return request.data
        } catch (err) {
            console.log(err)
            throw new Error("un erreur s'est produite. veuillez réessayer plus tard!")
        }
    }

    async sendSms(reciver, msg) {
        let authorization_header = 'Basic WGVpQUZ0SjcydXJSSWo1OElPbkduRjFVbDJVSENQM0E6d0RHcVVSWFlnWG9UbGh5eQ=='
        let auth_data = {
            grant_type: 'client_credentials'
        }
        let auth_ContentType = 'application/x-www-form-urlencoded'
        let auth_Authorization = authorization_header
        let token = await this.postWithHeader(this.config.get('ORANGE_AUTH_URI'), auth_data, auth_ContentType, auth_Authorization)


        let sms_data = {
            outboundSMSMessageRequest: {
                address: 'tel:+216' + reciver,
                senderName: "NAME COMPANY",
                senderAddress: 'tel:+2160000',
                outboundSMSTextMessage: {
                    message: msg
                }
            }
        }
        let sms_ContentType = 'application/json'
        let sms_Authorization = token.token_type + ' ' + token.access_token
        let sms = await this.postWithHeader(this.config.get('ORANGE_SMS_URI'), sms_data, sms_ContentType, sms_Authorization)
    }



}
