import { SetMetadata } from '@nestjs/common';
import { IS_ADMIN_KEY, IS_ALUMNI_KEY, IS_HEAD_KEY } from './constants';

export const IsAdmin = () => SetMetadata(IS_ADMIN_KEY, true);
export const IsAlumni = () => SetMetadata(IS_ALUMNI_KEY, true);
export const IsHead = () => SetMetadata(IS_HEAD_KEY, true);
