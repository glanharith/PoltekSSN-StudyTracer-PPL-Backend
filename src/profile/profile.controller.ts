import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileDTO } from './DTO';
import { response } from 'src/common/util/response';
import { IsAlumni, ReqUser } from 'src/common/decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @IsAlumni()
  @Get()
  async viewProfile(@ReqUser() request) {
    const dataProfile = await this.profileService.getProfilebyEmail(
      request.email,
    );
    return {
      message: 'Successfully got all profile information',
      data: dataProfile,
    };
  }

  @IsAlumni()
  @Patch()
  async editProfile(@ReqUser() request, @Body() profileDTO: ProfileDTO) {
    await this.profileService.edit(profileDTO, request.email);
    return response('Successfully update profile information');
  }
}
