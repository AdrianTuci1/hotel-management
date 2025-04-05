/**
 * @fileoverview Test simplu pentru a verifica că configurația Jest funcționează corect
 */

describe('Jest Setup Test', () => {
  test('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  test('should handle basic math operations', () => {
    expect(1 + 1).toBe(2);
    expect(2 * 3).toBe(6);
    expect(10 / 2).toBe(5);
  });

  test('should handle string operations', () => {
    expect('hello ' + 'world').toBe('hello world');
    expect('test'.toUpperCase()).toBe('TEST');
  });

  test('should handle array operations', () => {
    const array = [1, 2, 3];
    expect(array).toHaveLength(3);
    expect(array).toContain(2);
    expect(array[0]).toBe(1);
  });

  test('should handle object operations', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
  });
}); 