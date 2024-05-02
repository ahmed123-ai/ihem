import { ForbiddenException, Injectable } from '@nestjs/common';
import { changeMyPassword, forgetPasswordDto, loginDto, passCodeDto, registerDto } from './dto';
import * as argon from 'argon2'
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { UtilityService } from 'src/utility/utility.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private readonly config: ConfigService,
        private JwtToken: JwtService,
        private utility: UtilityService
    ) { }

    // @desc login
    // @route POST /auth/login
    // @access Public
    async login(dto: loginDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //verif exist 
        if (!user) {
            throw new ForbiddenException("Credentials incorrect")
        }
        //verif validate acount
        if (!user.validateUser) {
            throw new ForbiddenException("Utilisateur non vérifié")
        }
        //compare password 
        const pwMatches = await argon.verify(user.password, dto.password)
        //if the âssword incorrect throw exception
        if (!pwMatches) {
            throw new ForbiddenException("password incorrect")
        }
        //generate token
        return this.generateToken(user.id, user.email,  user.role, user.username,)


    }

    // @desc registerToken
    // @route POST /auth/registerToken
    // @access Public
    async registerToken(dto: registerDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //check exist
        if (user) {
            throw new ForbiddenException("Email déjà utilisé")
        }
        //hash password
        const hash = await argon.hash(dto.password);

        const token = uuidv4();

        const now = new Date();

        const timeValidity = new Date(now.getTime() + 20 * 60000);

        //create user 
        const userData = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hash,
                role: "local-user",
                validateUser: false,
                token,
                passcode: null,
                timeValidity
            }
        })

        const emailToSendTo = userData.email;

        //uri validate compte 
        const uri = this.config.get("FRONT_URI") + '/auth/validate/' + token;


        // Define the email data
        const mailData = {
            from: 'your_email@example.com',
            to: emailToSendTo,
            subject: 'Valider votre compte',
            text: 'Merci de nous avoir rejoints. Veuillez activer votre compte en utilisant ce lien  :  ' + uri,

        };
        //send mail
        this.utility.sendMail(mailData)
        //send msg
        return ({ data: 'Inscription réussie !' })

    }

    // @desc validateToken
    // @route GET /auth/validateToken
    // @access Public
    async validateToken(token: string) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                token: token,
                validateUser: false
            }
        })
        //verif unique user
        if (!user) {
            throw new ForbiddenException("Utilisateur introuvable!")
        }

        // check timeValidity token
        const now = new Date();
        if (now > user.timeValidity) {
            throw new ForbiddenException("Tu as dépassé le délai de validation")
        } else {
            await this.prisma.user.update({
                where: {
                    token: token,
                },
                data: {
                    token: null,
                    validateUser: true,
                    timeValidity: null
                },
            })
        }
        //send result
        return ({ data: "Votre compte a été validé avec succès." });


    }

    // @desc registerPassCode
    // @route POST /auth/registerPassCode
    // @access Public
    async registerPassCode(dto: registerDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //check exist
        if (user) {
            throw new ForbiddenException("Email déjà utilisé")
        }
        //hash password
        const hash = await argon.hash(dto.password);

        const passCode = this.makePassCode(5);

        const now = new Date();

        const timeValidity = new Date(now.getTime() + 20 * 60000);

        //create user 
        const userData = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hash,
                role: dto.role,
                validateUser: false,
                token: null,
                passcode: passCode,
                timeValidity
            }
        })

        const emailToSendTo = userData.email;

        // Define the email data
        const mailData = {
            from: 'your_email@example.com',
            to: emailToSendTo,
            subject: 'Valider votre compte',
            text: 'Votre code de validation est  :  ' + passCode + ' ce code valable 20mn',

        };
        //send mail
        this.utility.sendMail(mailData)
        //send msg
        return ({ data: 'Inscription réussie !' })

    }

    // @desc validateCode
    // @route POST /auth/validateCode
    // @access Public
    async validateCode(dto: passCodeDto) {

        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                passcode: dto.passCode,
                validateUser: false
            }
        })
        //verif unique user
        if (!user) {
            throw new ForbiddenException("Code incorrect")
        }

        // check timeValidity token
        const now = new Date();
        if (now > user.timeValidity) {
            throw new ForbiddenException("Tu as dépassé le délai de validation")
        } else {
            await this.prisma.user.update({
                where: {
                    passcode: dto.passCode,

                },
                data: {
                    passcode: null,
                    validateUser: true,
                    timeValidity: null
                },
            })
        }
        //send result
        return ({ data: "Votre compte a été validé avec succès." });
    }

    // @desc forgetPasswordCode
    // @route POST /auth/forget-password
    // @access Public
    async forgetPasswordCode(dto: forgetPasswordDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //verif exist 
        if (!user) {
            throw new ForbiddenException("Credentials incorrect")
        }
        //verif validate acount
        if (!user.validateUser) {
            throw new ForbiddenException("Utilisateur non vérifié")
        }

        const passCode = this.makePassCode(5)
        let now = new Date();
        const timeValidity = new Date(now.getTime() + 20 * 60000);
        //update info user
        await this.prisma.user.update({
            where: {
                email: dto.email
            },
            data: {
                passcode: passCode,
                timeValidity: timeValidity
            }
        })
        // Define the email data
        const mailData = {
            from: 'your_email@example.com',
            to: dto.email,
            subject: 'Code de vérification',
            text: 'Votre code de vérification est  :  ' + passCode + ' ce code valable 20mn',

        };
        //send passCode with mail
        this.utility.sendMail(mailData)


        //send res 
        return ({ data: "ok" })
    }
    // @desc forgetPasswordCode
    // @route POST /auth/forget-password/validCode
    // @access Public
    async valideCodeFrogetPassword(dto: passCodeDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                passcode: dto.passCode,

            }
        })
        //verif unique user
        if (!user) {
            throw new ForbiddenException("Code introuvable")
        }
        //verif validate acount
        if (!user.validateUser) {
            throw new ForbiddenException("Code non vérifié")
        }
        // check timeValidity token
        const now = new Date();
        if (now > user.timeValidity) {
            throw new ForbiddenException("Code non valide")
        } else {
            await this.prisma.user.update({
                where: {
                    passcode: dto.passCode,

                },
                data: {
                    passcode: null,
                    timeValidity: null
                },
            })
        }
        //send result
        return ({ data: true });
    }
    // @desc forgetPasswordToken
    // @route POST /auth/forget-password-token
    // @access Public
    async forgetPasswordToken(dto: forgetPasswordDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //verif exist 
        if (!user) {
            throw new ForbiddenException("Credentials incorrect")
        }
        //verif validate acount
        if (!user.validateUser) {
            throw new ForbiddenException("Utilisateur non vérifié")
        }

        const token = uuidv4()
        let now = new Date();
        const timeValidity = new Date(now.getTime() + 20 * 60000);
        //update info user
        await this.prisma.user.update({
            where: {
                email: dto.email
            },
            data: {
                token: token,
                timeValidity: timeValidity
            }
        })
        const uri = this.config.get("FRONT_URI") + '/auth/verif-token/' + token;

        // Define the email data
        const mailData = {
            from: 'your_email@example.com',
            to: dto.email,
            subject: 'Code de vérification',
            text: 'Merci de cliqué sur ce URL pour changer ton mot de passe :  ' + uri,

        };
        //send passCode with mail
        this.utility.sendMail(mailData)


        //send res 
        return ({ data: "ok" })
    }
    // @desc forgetPasswordToken
    // @route GET /auth/forget-password-token/:token
    // @access Public
    async valideTokenForgetPassword(token: string) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                token: token,
            }
        })
        //verif unique user
        if (!user) {
            throw new ForbiddenException("Utilsateur introuvable")
        }
        //verif validate acount
        if (!user.validateUser) {
            throw new ForbiddenException("Utilsateur non vérifié")
        }
        // check timeValidity token
        const now = new Date();
        if (now > user.timeValidity) {
            throw new ForbiddenException("Vous avez dépassé le temps de validation de votre compte pour changer votre mot de passe.")
        } else {
            await this.prisma.user.update({
                where: {
                    token: token,

                },
                data: {
                    token: null,
                    timeValidity: null
                },
            })
        }
        //send result
        return ({ data: true });

    }
    // @desc changeMyPassword
    // @route POST /auth/change-my-password
    // @access Public
    async changeMyPassword(dto: changeMyPassword) {
        //find user 
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
                role: "local-user"
            }
        })
        //verif match password
        if (dto.password != dto.confirmPasword) {
            throw new ForbiddenException("Mot de passe n'est pas identique")

        }
        //verif exist 
        if (!user) {
            throw new ForbiddenException("Credentials incorrect")
        }
        //verif validate acount
        if (!user.validateUser) {
            throw new ForbiddenException("Utilisateur non vérifié")
        }
        //hash new pâssowrd
        const hash = await argon.hash(dto.password)
        await this.prisma.user.update({
            where: {
                email: dto.email,
                role: "local-user"
            },
            data: {
                password: hash
            }
        })
        //send result
        return ({ data: "ok" })
    }

    // @desc resendValidationPassCode
    // @route POST /auth/resend-validation
    // @access Public
    async resendValidationPassCode(dto: forgetPasswordDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //verif exist 
        if (!user) {
            throw new ForbiddenException("Credentials incorrect")
        }
        if (user.validateUser) {
            throw new ForbiddenException("Utilsateur est déja verfié")

        }


        const passCode = this.makePassCode(5)
        let now = new Date();
        const timeValidity = new Date(now.getTime() + 20 * 60000);
        //update info user
        await this.prisma.user.update({
            where: {
                email: dto.email
            },
            data: {
                passcode: passCode,
                timeValidity: timeValidity
            }
        })

        // Define the email data
        const mailData = {
            from: 'your_email@example.com',
            to: dto.email,
            subject: 'Code de vérification',
            text: 'Votre code de vérification est  :  ' + passCode + ' ce code valable 20mn',

        };
        //send passCode with mail
        this.utility.sendMail(mailData)


        //send res 
        return ({ data: "ok" })


    }

    // @desc resendValidationToken
    // @route POST /auth/resend-validation-token
    // @access Public
    async resendValidationToken(dto: forgetPasswordDto) {
        //find user
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        //check user 
        if (!user) {
            throw new ForbiddenException("Invalid utilisateur")
        }
        if (user.validateUser) {
            throw new ForbiddenException("Utilsateur est déja verfié")

        }

        const newToken = uuidv4();

        const now = new Date();

        const timeValidity = new Date(now.getTime() + 20 * 60000);

        //update info user
        await this.prisma.user.update({
            where: {
                email: dto.email
            },
            data: {
                token: newToken,
                timeValidity: timeValidity
            }
        })


        const uri = this.config.get("FRONT_URI") + '/auth/new-token/' + newToken;

        // Define the email data
        const mailData = {
            from: 'your_email@example.com',
            to: user.email,
            subject: 'Vérification compte ',
            text: 'Merci de cliqué sur ce URL pour changer ton mot de passe :  ' + uri,

        };
        //send passCode with mail
        this.utility.sendMail(mailData)


        //send res 
        return ({ data: "ok" })



    }

    // @desc listingUser
    // @route GET /auth
    // @access Private
    async listingUser() {
        const users = await this.prisma.user.findMany()
        return ({ data: users })
    }
    // @desc sendSms
    // @route GET /auth/sendSms
    // @access Public
    async sendSms() {
        let reciver = " "
        let msg = ""
        await this.utility.sendSms(reciver, msg)
        return ({ data: "ok" })
    }

    // @desc intern
    async generateToken(userId: string, email: string, role: string,username:string): Promise<{ data: string }> {
        const payload = {
            sub: userId,
            username,
            email,
            role
        }
        const secret = this.config.get("JWT_SECRET")
        const token = await this.JwtToken.signAsync(payload, {
            expiresIn: "200h",
            secret: secret
        })
        return {
            data: token
        }
    }
    // @desc intern
    makePassCode(length) {
        let result = '';
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }


}


