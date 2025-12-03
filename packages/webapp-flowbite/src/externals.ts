import { setCustomComponents } from "@freon4dsl/core-svelte"

// For InsuranceModel:
import ShowAnimatedGif from "./customComponents/forInsurance/ShowAnimatedGif.svelte";
import FB_Card_Component from "./customComponents/forInsurance/FB_Card_Component.svelte";
import FB_Accordion from "./customComponents/forInsurance/FB_Accordion.svelte";
import FB_Dialog from "./customComponents/forInsurance/FB_Dialog.svelte";
import DatePicker from "./customComponents/forInsurance/DatePicker.svelte";

// For ExternalTester:
// import BooleanWrapperComponent from "./customComponents/forExternalTester/BooleanWrapperComponent.svelte";
// import NumberWrapperComponent from "./customComponents/forExternalTester/NumberWrapperComponent.svelte";
// import StringWrapperComponent from "./customComponents/forExternalTester/StringWrapperComponent.svelte";
// import FragmentWrapperComponent from "./customComponents/forExternalTester/FragmentWrapperComponent.svelte";
// import ExternalStringComponent from "./customComponents/forExternalTester/ExternalStringComponent.svelte";
// import ExternalSimpleComponent from "./customComponents/forExternalTester/ExternalSimpleComponent.svelte";
// import ExternalRefListComponent from "./customComponents/forExternalTester/ExternalRefListComponent.svelte";
// import ExternalRefComponent from "./customComponents/forExternalTester/ExternalRefComponent.svelte";
// import ExternalPartListComponent from "./customComponents/forExternalTester/ExternalPartListComponent.svelte";
// import ExternalPartComponent from "./customComponents/forExternalTester/ExternalPartComponent.svelte";
// import ExternalNumberComponent from "./customComponents/forExternalTester/ExternalNumberComponent.svelte";
// import ExternalBooleanComponent from "./customComponents/forExternalTester/ExternalBooleanComponent.svelte";
// import PartWrapperComponent from "./customComponents/forExternalTester/PartWrapperComponent.svelte";
// import PartListWrapperComponent from "./customComponents/forExternalTester/PartListWrapperComponent.svelte";
// import RefWrapperComponent from "./customComponents/forExternalTester/RefWrapperComponent.svelte";
// import RefListWrapperComponent from "./customComponents/forExternalTester/RefListWrapperComponent.svelte";
// import ReplacePartInConceptWithParts from './customComponents/forExternalTester/ReplacePartInConceptWithParts.svelte';
// import ReplacePartListInConceptWithParts
//     from './customComponents/forExternalTester/ReplacePartListInConceptWithParts.svelte';
// import ReplaceRefInConceptWithRefs from './customComponents/forExternalTester/ReplaceRefInConceptWithRefs.svelte';
// import ReplaceRefListInConceptWithRefs
//     from './customComponents/forExternalTester/ReplaceRefListInConceptWithRefs.svelte';

// For CourseSchedule:
// import PersonIcon from "./customComponents/forCourseSchedule/PersonIcon.svelte"
// import PhoneButton from "./customComponents/forCourseSchedule/PhoneButton.svelte"
// import StaffAccordion from "./customComponents/forCourseSchedule/StaffAccordion.svelte"
// import Schedule from "./customComponents/forCourseSchedule/Schedule.svelte"

/**
 * Configure the external components used, so Freon can find them.
 */
export function configureExternals() {
    /**
     * Make the external components known to Freon before starting the app!
     */
    // For CourseSchedule:
    // setCustomComponents([
    //     { component: PersonIcon, knownAs: "PersonIcon" },
    //     { component: PhoneButton, knownAs: "PhoneButton" },
    //     { component: StaffAccordion, knownAs: "StaffAccordion" },
    //     { component: Schedule, knownAs: "Schedule" },
    // ])
    // For InsuranceModel:
    setCustomComponents([
    	{component: ShowAnimatedGif, knownAs: "AnimatedGif"},
    	{component: FB_Card_Component, knownAs: "ExternalCard"},
    	{component: FB_Accordion, knownAs: "ExternalAccordion"},
    	{component: FB_Dialog, knownAs: "ExternalDialog"},
    	{component: DatePicker, knownAs: "DatePicker"}
    ]);
    // For ExternalTester:
    // setCustomComponents([
    //     { component: BooleanWrapperComponent, knownAs: "booleanWrapper" },
    //     { component: FragmentWrapperComponent, knownAs: "fragmentWrapper" },
    //     { component: NumberWrapperComponent, knownAs: "numberWrapper" },
    //     { component: PartWrapperComponent, knownAs: "partWrapper" },
    //     { component: PartListWrapperComponent, knownAs: "partListWrapper" },
    //     { component: RefWrapperComponent, knownAs: "refWrapper" },
    //     { component: RefListWrapperComponent, knownAs: "refListWrapper" },
    //     { component: StringWrapperComponent, knownAs: "stringWrapper" },
    //
    //     { component: ExternalBooleanComponent, knownAs: "booleanReplacer" },
    //     { component: ExternalNumberComponent, knownAs: "numberReplacer" },
    //     { component: ExternalPartComponent, knownAs: "partReplacer" },
    //     { component: ReplacePartInConceptWithParts, knownAs: "partReplacer2" },
    //     { component: ExternalPartListComponent, knownAs: "partListReplacer" },
    //     { component: ReplacePartListInConceptWithParts, knownAs: "partListReplacer2" },
    //     { component: ExternalRefComponent, knownAs: "refReplacer" },
    //     { component: ReplaceRefInConceptWithRefs, knownAs: "refReplacer2" },
    //     { component: ReplaceRefListInConceptWithRefs, knownAs: "refListReplacer2" },
    //     { component: ExternalRefListComponent, knownAs: "refListReplacer" },
    //     { component: ExternalSimpleComponent, knownAs: "simple" },
    //     { component: ExternalStringComponent, knownAs: "stringReplacer" },
    // ]);
}
