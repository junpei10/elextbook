export const classInjectionTokenFactory = <T>(value: T): T => {
  const member = {
    factory(): any {
      return this._ = value;
    }
  };

  return member.factory();
};
