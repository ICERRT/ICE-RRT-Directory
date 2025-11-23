//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [...tanstackConfig,
{
  "@typescript-eslint/array-type": [
    "error", {
      "default": "array",
    }]
}
]
