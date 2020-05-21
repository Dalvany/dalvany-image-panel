export interface DynamicImageOptions {
  baseUrl: string;
  suffix: string;
  singleFill: boolean;
  width: number;
  height: number;
}

export const defaults: DynamicImageOptions = {
  baseUrl: 'http://openweathermap.org/img/wn/',
  suffix: '@2x.png',
  singleFill: true,
  width: 75,
  height: 75,
};
