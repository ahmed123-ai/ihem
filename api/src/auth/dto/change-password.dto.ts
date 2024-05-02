import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class changeMyPassword {

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPasword: string;

}

