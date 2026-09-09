# Security policy

## Supported versions

Security fixes target the latest `main` and current 1.x release. Older snapshots are not maintained separately.

## Report privately

Use [GitHub private vulnerability reporting](https://github.com/KiritoKing/term-style-blog/security/advisories/new). Please do not post exploitable vulnerabilities, tokens, private article content or personal information in public Issues.

Include the affected commit/version, a minimal reproduction using synthetic content, expected impact and relevant sanitized logs. Do not test against another person's vault or account. There is no guaranteed response time or paid bounty program.

## Deployment boundary

Local development and pull-request CI use included demo Markdown and do not need private services. The personal publication workflow is restricted to this repository's main ref, uses immutable approved snapshots, and defaults to manual-review previews. Repository secrets are not configuration examples.

Public Actions logs and artifacts must contain only approved publication data or synthetic fixtures. `noindex` is not access control. Do not submit private drafts to public CI. Keep deployment keys in the secret store, grant only required permissions, and rotate any credential that was disclosed.

The visual-audit helper sends screenshots to the configured model provider when enabled. Review the scope before using it on private content; it is not part of default CI.

中文：漏洞请通过上方私密入口报告，附版本、合成数据复现和脱敏日志。不要在公开 Issue 中粘贴密钥、私人笔记或未公开文章。
