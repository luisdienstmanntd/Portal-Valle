export const experienceFlows = {
  cinema: { slug:"cine-toscana", name:"Cine Toscana", description:"Um encontro para desacelerar e apreciar um bom filme.",
    category:"cinema", capacity:4, adults:8, unit:"puffs", film:true,
    occurrenceRpc:"portal_save_occurrence", bookingRpc:"portal_save_booking" },
  pizza: { slug:"la-vera-pizza", name:"La Vera Pizza", description:"Uma noite de pizza napolitana na taverna.",
    category:"gastronomy", capacity:12, adults:12, unit:"adultos", film:false,
    occurrenceRpc:"portal_pizza_save_occurrence", bookingRpc:"portal_pizza_save_booking" },
} as const;
export type ExperienceFlow = keyof typeof experienceFlows;
export function getExperienceFlow(key:string) {
  return key==="cinema"||key==="pizza"?experienceFlows[key]:null;
}
