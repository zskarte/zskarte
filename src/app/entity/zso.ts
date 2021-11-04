import { Viewport } from './viewport';

export interface ZSO {
  id: string;
  name: string;
  auth: string;
  url: string;
  initialViewPort: Viewport;
  defaultLocale: string;
}

export function getZSOById(zsoId: string): ZSO {
  for (const z of LIST_OF_ZSO) {
    if (zsoId === z.id) {
      return z;
    }
  }
  return null;
}

export const ZSO_BE_AT: ZSO = {
  id: 'zso_be_at',
  name: 'ZSO Aaretal',
  auth: 'a885da7695a8c0a2704c95dc5fe8ec83',
  initialViewPort: {
    coordinates: [842606.17, 5922886.81],
    zoomLevel: 16,
  },
  url: 'https://www.zso-muensingen.ch/',
  defaultLocale: 'de',
};

export const ZSO_BE_BA: ZSO = {
  id: 'zso_be_ba',
  name: 'ZSO Bantiger',
  auth: 'fbaae0e6ab16e582b38a7fe0119f9ee2',
  initialViewPort: {
    coordinates: [834201.55, 5934229.72],
    zoomLevel: 16,
  },
  url: 'https://www.ostermundigen.ch/zivilschutz',
  defaultLocale: 'de',
};

export const ZSO_BE_BP: ZSO = {
  id: 'zso_be_bp',
  name: 'ZSO Bern plus',
  auth: '48c8a0ae3e192e2eec155e0c2bc02f02',
  initialViewPort: {
    coordinates: [829038.2228723184, 5933590.521128002],
    zoomLevel: 16,
  },
  url: 'https://www.bern.ch/politik-und-verwaltung/stadtverwaltung/sue/schutz-und-rettung-bern/zivilschutz/',
  defaultLocale: 'de',
};

export const ZSO_BE_BS: ZSO = {
  id: 'zso_be_bs',
  name: 'Amt für Bevölkerungsschutz, Sport und Militär des Kantons Bern',
  auth: 'c177b2827e860f2b55500964ab9dc090',
  initialViewPort: {
    coordinates: [830544.7, 5935141.38],
    zoomLevel: 16,
  },
  url: 'https://www.bsm.sid.be.ch/',
  defaultLocale: 'de',
};

export const ZSO_BE_GN: ZSO = {
  id: 'zso_be_gn',
  name: 'ZSO Grauholz Nord',
  auth: '5bbbd390896fbea482d187770a3bd46a',
  initialViewPort: {
    coordinates: [836354.47, 5950399.28],
    zoomLevel: 16,
  },
  url: 'https://www.bevs-grauholz.ch/',
  defaultLocale: 'de',
};

export const ZSO_BE_JB: ZSO = {
  id: 'zso_be_jb',
  name: 'PCi Jura Bernois',
  auth: '954e61c327499c1face095a3ee3182f2',
  initialViewPort: {
    coordinates: [791469.33, 5978528.31],
    zoomLevel: 16,
  },
  url: 'https://www.opcjb.ch/',
  defaultLocale: 'fr',
};

export const ZSO_BE_RA: ZSO = {
  id: 'zso_be_ra',
  name: 'ZS Region Aarberg',
  auth: '28694ea6267e914855e3488d0b4e6827',
  initialViewPort: {
    coordinates: [813362.88, 5954168.67],
    zoomLevel: 16,
  },
  url: 'https://www.zsra.ch/',
  defaultLocale: 'de',
};

export const ZSO_BE_SA: ZSO = {
  id: 'zso_be_sa',
  name: 'ZSO Saanen plus',
  auth: '6a28e717f4936517a96e36956983935a',
  initialViewPort: {
    coordinates: [808448.9, 5859305.26],
    zoomLevel: 16,
  },
  url: 'https://www.zsosaanenplus.ch/',
  defaultLocale: 'de',
};

export const ZSO_BE_SP: ZSO = {
  id: 'zso_be_sp',
  name: 'ZSO Spiez',
  auth: '82be7ff7634714d572ca955f7021f6c4',
  initialViewPort: {
    coordinates: [854633.13, 5891978.82],
    zoomLevel: 16,
  },
  url: 'https://www.spiez.ch/de/verwaltung/abteilungen/detail.php?i=29',
  defaultLocale: 'de',
};

export const ZSO_BE_SZ: ZSO = {
  id: 'zso_be_sz',
  name: 'ZSO Steffisburg-Zulg',
  auth: '5e209578d1d35e83ef2a9689fffd798b',
  initialViewPort: {
    coordinates: [850059.01, 5905922.76],
    zoomLevel: 16,
  },
  url: 'https://www.steffisburg.ch/de/verwaltung/abteilungen/62_zivilschutz-steffisburg-zulg',
  defaultLocale: 'de',
};

export const ZSO_BE_TP: ZSO = {
  id: 'zso_be_tp',
  name: 'ZSO Thun plus',
  auth: 'd8becf30d11b55b35068f7119bbe6ef0',
  initialViewPort: {
    coordinates: [849143.74, 5902660.63],
    zoomLevel: 16,
  },
  url: 'https://www.zsothunplus.ch/zso',
  defaultLocale: 'de',
};

export const ZSO_FR_FR: ZSO = {
  id: 'zso_fr_fr',
  name: 'PCi Fribourgeoise',
  auth: 'f567e31a75e3e413e018e96b6ea80ac8',
  initialViewPort: {
    coordinates: [784702.5323756159, 5912939.19705637],
    zoomLevel: 10,
  },
  url: 'https://www.fr.ch/dsj/sppam/sommaire/protection-civile',
  defaultLocale: 'fr',
};

export const ZSO_GUEST: ZSO = {
  id: 'zso_guest',
  name: 'ZSO Gast (1h)',
  auth: '',
  initialViewPort: {
    coordinates: [828547.63, 5933321.42],
    zoomLevel: 16,
  },
  url: 'https://zskarte.ch/',
  defaultLocale: 'de',
};

export const LIST_OF_ZSO: ZSO[] = [
  ZSO_BE_AT,
  ZSO_BE_BA,
  ZSO_BE_BP,
  ZSO_BE_BS,
  ZSO_BE_GN,
  ZSO_BE_JB,
  ZSO_BE_RA,
  ZSO_BE_SA,
  ZSO_BE_SP,
  ZSO_BE_SZ,
  ZSO_BE_TP,
  ZSO_GUEST,
];
