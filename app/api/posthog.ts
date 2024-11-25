import posthog from "posthog-js";

export const init_posthog = () => {
  if (process.env.REACT_APP_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.REACT_APP_PUBLIC_POSTHOG_KEY, {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    });
  }
};
