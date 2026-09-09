# Third-party notices and content boundaries

The root MIT license covers original application code, documentation and synthetic/demo examples. It does not replace the licenses of third-party components or grant rights to external blog content or personal identity.

## Historical design prototypes

This owner's source release also includes the project's original design prototypes retained in Git history under `reference/ref-template/`, `reference/ref-template-new/`, `reference/pixel-console-blog.zip` and `reference/pixel-console-blog (1).zip`. Their project-original code is included in the MIT grant in the root LICENSE, including portions later adapted into the terminal interface. AI Studio export scaffolding and references to npm packages do not replace those packages' own licenses. Preserve any upstream copyright notices when extracting or reusing historical material.

## Astro starter

This project began with the [Astro basics starter](https://github.com/withastro/astro/tree/main/examples/basics). Retained starter files include `src/components/Welcome.astro`, `src/assets/astro.svg`, `src/assets/background.svg`, `public/favicon.svg` and `public/favicon.ico`.

[Upstream license](https://github.com/withastro/astro/blob/main/LICENSE):

```text
MIT License

Copyright (c) 2021 Fred K. Schott

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

"""
This license applies to parts of the `packages/create-astro` and `packages/astro` subdirectories originating from the https://github.com/sveltejs/kit repository:

Copyright (c) 2020 [these people](https://github.com/sveltejs/kit/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
"""

"""
This license applies to parts of the `packages/create-astro` and `packages/astro` subdirectories originating from the https://github.com/vitejs/vite repository:

MIT License

Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
```

## Neofetch ASCII artwork

The inline `NEOFETCH_LOGOS` artwork in `src/components/react/SystemInfo.tsx` derives from [Neofetch](https://github.com/dylanaraps/neofetch). The repository also retains a development helper, `tools/extract_neofetch_ascii.py`, for extracting upstream artwork. Operating-system names and marks belong to their respective owners; the UI does not imply their endorsement.

[Upstream license](https://github.com/dylanaraps/neofetch/blob/master/LICENSE.md):

```text
The MIT License (MIT)

Copyright (c) 2015-2021 Dylan Araps

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Dependencies and development tools

Packages in `pnpm-lock.yaml` retain their own licenses. Notable direct dependencies include Astro, React, Tailwind, Mermaid, Shiki, Pagefind, Gray Matter and Remark (MIT); Lucide (ISC); and Sharp, TypeScript and Playwright (Apache-2.0). This source release does not bundle `node_modules`, compiled site assets or native binaries. If redistributing a built bundle, include the notices required by the exact bundled dependency versions; use `pnpm licenses list` to inspect the installed graph.

Generated OpenSpec skills in `.agents/skills/` retain their `author: openspec` and `license: MIT` metadata. Giscus is loaded from its hosted service and is not vendored in this repository. Named fallback fonts are not bundled font files.

## Articles, screenshots and personal identity

The included demo Markdown and synthetic test fixtures are provided with the source under MIT. Actual articles live in a separate publication source. The author's online article footer specifies [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/); external media may have its own attribution or license. The source MIT license does not relicense those articles or third-party material.

`docs/images/terminal-blog.png` is an unmodified screenshot of the public blog for documentation. The software interface follows the source license; article text visible within it retains its article-content license. Replace the author's name, links, domain and comment configuration when publishing a fork.
