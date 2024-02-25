import { Body, Controller, Get, Param, Patch, Post, RequestMapping, Request, NotFoundException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileDTO} from './DTO';
import { response } from 'src/common/util/response';
import { IsAdmin, IsAlumni, ReqUser } from 'src/common/decorator';
import { request } from 'http';


@Controller('profile')
export class ProfileController {
   constructor(private readonly profileService: ProfileService) {}

  @IsAlumni()
  @Get()
  async viewProfile(@Request()request) {
    const dataProfile = await this.profileService.getProfilebyId(request.user.email);
    return { message: "Successfully got all profile information", data: dataProfile };
  
  }

  @IsAlumni()
  @Patch()
  async editProfile(@Request() request, @Body() profileDTO: ProfileDTO) {
    await this.profileService.edit(profileDTO, request.user.email)
    return response("Successfully updated profile information")
  }

}
