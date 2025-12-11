import { useCallback } from 'react';
import introJs from 'intro.js';
import 'intro.js/minified/introjs.min.css';

interface TutorialStep {
  element?: string;
  intro: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightClass?: string;
}

export function useDashboardTutorial() {
  const startTutorial = useCallback(() => {
    const steps: TutorialStep[] = [
      {
        element: '.tutorial-welcome',
        intro: 'Welcome to BoilerMeets! 👋 This quick tour will show you how to use the app.',
        position: 'center',
      },
      {
        element: '.tutorial-find-friends',
        intro: 'Click here to find new friends! You\'ll be randomly matched with other users looking for friendships.',
        position: 'bottom',
      },
      {
        element: '.tutorial-find-romance',
        intro: 'Or try finding romance! Get matched with users based on compatibility.',
        position: 'bottom',
      },
      {
        element: '.tutorial-profile',
        intro: 'Visit your profile to update your information, interests, and photos.',
        position: 'bottom',
      },
      {
        element: '.tutorial-matches',
        intro: 'Here you can see all your matches and start conversations.',
        position: 'right',
      },
      {
        element: '.tutorial-notifications',
        intro: 'Check notifications for new messages and calls.',
        position: 'bottom',
      },
      {
        element: '.tutorial-tutorial',
        intro: 'Click this button to redo the tutorial any time!',
        position: 'bottom',
      },
    ];

    const intro = introJs();
    intro.setOptions({
      steps: steps as any,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Done!',
      skipLabel: 'X',
      showButtons: true,
      exitOnEsc: true,
      exitOnOverlayClick: true,
      disableInteraction: false,
    });

    intro.start();
  }, []);

  return { startTutorial };
}

export function useProfileTutorial() {
  const startTutorial = useCallback(() => {
    const steps: TutorialStep[] = [
      {
        intro: 'This is your profile page, here you can edit your profile which other users can see.',
        position: 'center',
      },
      {
        element: '.tutorial-looking-for',
        intro: 'Click any button here to set the preferences of what you\'re looking for while using BoilerMeets.',
        position: 'bottom',
      },
      {
        element: '.tutorial-bio',
        intro: 'Here is your bio, click on the text to edit it at any time.',
        position: 'bottom',
      },
      {
        element: '.tutorial-modules',
        intro: 'Any modules you create will be displayed in this window here. Modules will be visible to other users during calls. Modules are how other people get to know you better!',
        position: 'right',
      },
      {
        intro: 'Other people will be able to view your profile page just as you see it here.',
        position: 'bottom',
      },
    ];

    const intro = introJs();
    intro.setOptions({
      steps: steps as any,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Done!',
      skipLabel: 'X',
      showButtons: true,
      exitOnEsc: true,
      exitOnOverlayClick: true,
      disableInteraction: false,
    });

    intro.start();
  }, []);

  return { startTutorial };
}

export function useVideoTutorial() {
  const startTutorial = useCallback(() => {
    const steps: TutorialStep[] = [
      {
        intro: 'This is the video call page, here you can call other users.',
        position: 'center',
      },
      {
        element: '.tutorial-feed',
        intro: 'Here is the video feed of the other user.',
        position: 'bottom',
      },
      {
        element: '.tutorial-your-feed',
        intro: 'Here you can see your video feed. This can be toggled on and off.',
        position: 'bottom',
      },
      {
        element: '.tutorial-buttons',
        intro: 'This row of buttons contains toggles for your audio and video, a background changer, a hang up button, and a games feature. Once the call has gone on for enough time, a match button will also appear here.',
        position: 'right',
      },
      {
        element: '.tutorial-about',
        intro: 'This section contains the module information about the user you are calling, and is how they see your modules during the call!',
        position: 'left',
      },
    ];

    const intro = introJs();
    intro.setOptions({
      steps: steps as any,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Done!',
      skipLabel: 'X',
      showButtons: true,
      exitOnEsc: true,
      exitOnOverlayClick: true,
      disableInteraction: false,
    });

    intro.start();
  }, []);

  return { startTutorial };
}
