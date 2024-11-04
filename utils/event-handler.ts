import toast from 'react-hot-toast';

import { eventCenter } from './event-center';

import { Event } from '@/types';

export function handleEvent(eventData: string) {
  try {
    const event: Event = JSON.parse(eventData);

    eventCenter.dispatch(event);
  } catch (error) {
    toast.error('Error: Data is not a valid event');
  }
}
