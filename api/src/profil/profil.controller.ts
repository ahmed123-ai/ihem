import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProfilService } from './profil.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateProfileDto } from './dto/create-profil.dto';
import { Roles, GetUser } from 'src/auth/decorator';
import { RolesGuard } from 'src/auth/guard';
  

@UseGuards(AuthGuard("jwt"), RolesGuard)
 

@Controller('profil')
export class ProfilController {
  constructor(private   profilService: ProfilService) {}
  

  add(
    @Body() dto :CreateProfileDto
  ){  }

 
}
