export const data = {
  flySpeed: 100,
  coordinates: {
    longitute: 2,
    latitude: 2,
    altitude: 3,
  },
  // amount of nectar
  nectar: 200,
  // amount of honey
  honey: 3,
  fuelLevel: 20,
};

export interface dataProps {
  flySpeed: number;
  coordinates: {
    longitute: number;
    latitude: number;
    altitude: number;
  };
  nectar: number;
  honey: number;
  fuelLevel: number;
}

// export type dataProps = keyof typeof data;
