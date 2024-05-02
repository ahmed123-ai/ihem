import {  IsEmail, IsNotEmpty, IsString } from "class-validator";

 
export class forgetPasswordDto {
 
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email:string;
 

}

