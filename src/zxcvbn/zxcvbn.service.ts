import { Injectable, OnModuleInit } from '@nestjs/common';
import { zxcvbn, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import * as zxcvbnIdPackage from '@zxcvbn-ts/language-id';
import { matcherPwnedFactory } from '@zxcvbn-ts/matcher-pwned';

@Injectable()
export class ZxcvbnService implements OnModuleInit {
  onModuleInit() {
    const matcherPwned = matcherPwnedFactory(fetch, zxcvbnOptions);
    zxcvbnOptions.addMatcher('pwned', matcherPwned);
    zxcvbnOptions.setOptions({
      translations: zxcvbnEnPackage.translations,
      graphs: zxcvbnCommonPackage.adjacencyGraphs,
      dictionary: {
        ...zxcvbnCommonPackage.dictionary,
        ...zxcvbnEnPackage.dictionary,
        ...zxcvbnIdPackage.dictionary,
      },
    });
  }

  async getScore(password: string): Promise<number> {
    const { score } = await zxcvbnAsync(password);
    return score;
  }
}
