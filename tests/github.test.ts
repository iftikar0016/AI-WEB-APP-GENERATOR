import { createMitLicense, getGitHubPagesUrl } from '@/lib/github';

describe('GitHub utilities', () => {
  describe('createMitLicense', () => {
    it('should generate MIT license with current year and username', () => {
      const license = createMitLicense('test-user');
      const currentYear = new Date().getFullYear();

      expect(license).toContain(`Copyright (c) ${currentYear} test-user`);
      expect(license).toContain('MIT License');
      expect(license).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
    });
  });

  describe('getGitHubPagesUrl', () => {
    it('should generate correct Pages URL', () => {
      const url = getGitHubPagesUrl('test-user', 'test-repo');
      expect(url).toBe('https://test-user.github.io/test-repo/');
    });
  });
});
