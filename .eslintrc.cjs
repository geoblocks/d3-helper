module.exports = {
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	root: true,
	env: {
		browser: true,
                jest: true
	},
	overrides: [{
		files: [
		        "*.spec.ts"
                ],
		rules: {
			"@typescript-eslint/ban-ts-comment": "warn",
		}
	}, {
		files: [
			"*.ts"
                ],
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
                },
        }]
};
