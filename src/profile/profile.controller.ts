import { Body, Controller, Get, Patch, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileDTO} from './DTO';
import { response } from 'src/common/util/response';
import { IsAlumni } from 'src/common/decorator';


@Controller('profile')
export class ProfileController {
   constructor(private readonly profileService: ProfileService) {}

  @IsAlumni()
  @Get()
  async viewProfile(@Request()request) {
    const dataProfile = await this.profileService.getProfilebyEmail(request.user.email);
    return { message: "Successfully got all profile information", data: dataProfile };
  
  }

  @IsAlumni()
  @Patch()
  async editProfile(@Request() request, @Body() profileDTO: ProfileDTO) {
    await this.profileService.edit(profileDTO, request.user.email)
    return response("Successfully update profile information")
  }

}
