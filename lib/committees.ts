/** Committee/section definitions mapping tags to display info */
export interface CommitteeInfo {
  tag: string;
  name: string;
  shortName: string;
  description: string;
  /** matches old WordPress page path */
  oldPath: string;
}

export const COMMITTEES: CommitteeInfo[] = [
  {
    tag: "full-council",
    name: "Full Council",
    shortName: "Full Council",
    description: "Agendas, minutes and supporting papers for Full Council meetings.",
    oldPath: "/town-council/agendas-minutes/full-council/",
  },
  {
    tag: "finance-personnel",
    name: "Finance & Personnel Committee",
    shortName: "Finance & Personnel",
    description: "Agendas, minutes and supporting papers for the Finance & Personnel Committee.",
    oldPath: "/town-council/agendas-minutes/finance-and-personel/",
  },
  {
    tag: "tourism-marketing",
    name: "Tourism & Marketing Committee",
    shortName: "Tourism & Marketing",
    description: "Agendas, minutes and supporting papers for the Tourism & Marketing Committee.",
    oldPath: "/town-council/agendas-minutes/tourism-and-marketing/",
  },
  {
    tag: "annual-assembly",
    name: "Annual Town Assembly",
    shortName: "Annual Assembly",
    description: "Agendas and minutes from the Annual Town Assembly.",
    oldPath: "/town-council/agendas-minutes/annual-town-assembly/",
  },
  {
    tag: "joint-committee",
    name: "Joint Council Committee",
    shortName: "Joint Committee",
    description: "Agendas, minutes and supporting papers for the Joint Council Committee.",
    oldPath: "/town-council/agendas-minutes/joint-council-committee/",
  },
  {
    tag: "archived",
    name: "Archived Minutes",
    shortName: "Archived",
    description: "Compiled annual minutes from previous years.",
    oldPath: "/town-council/agendas-minutes/archived-minutes/",
  },
];

export const GOVERNANCE_TAG = "governance";
export const FINANCE_TAG = "finance";

export function getCommitteeByTag(tag: string): CommitteeInfo | undefined {
  return COMMITTEES.find((c) => c.tag === tag);
}
