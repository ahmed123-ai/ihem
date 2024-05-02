import {  IsNotEmpty, IsString } from "class-validator";

 
export class passCodeDto {
 

    @IsString()
    @IsNotEmpty()
    passCode:string;
 






}

