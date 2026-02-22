import { ThrottlerInterceptor } from './throttler.interceptor.js';

describe('ThrottlerInterceptor', () => {
  it('should be defined', () => {
    expect(new ThrottlerInterceptor()).toBeDefined();
  });
});
