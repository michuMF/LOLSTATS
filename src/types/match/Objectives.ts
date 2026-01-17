export interface Objectives {
  atakhan: Atakhan;
  baron: Baron;
  champion: Champion;
  dragon: Dragon;
  horde: Horde;
  inhibitor: Inhibitor;
  riftHerald: RiftHerald;
  tower: Tower;
}

export interface Horde {
  first: boolean;
  kills: number;
}

export interface Atakhan {
  first?: boolean;
  kills?: number;
}

export interface Baron {
  first: boolean;
  kills: number;
}

export interface Champion {
  first: boolean;
  kills: number;
}

export interface Dragon {
  first: boolean;
  kills: number;
}

export interface Inhibitor {
  first: boolean;
  kills: number;
}

export interface RiftHerald {
  first: boolean;
  kills: number;
}

export interface Tower {
  first: boolean;
  kills: number;
}