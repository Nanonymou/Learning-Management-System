import { useCallback, useEffect, useState } from 'react';
import { getReadingSummary, type ReadingSummary } from '@/features/material/services/readingProgress.service';
import { getCurrentUser } from '@/features/participant/participant.service';
import { hasAttendedToday } from '@/features/attendance/attendance.service';
import { hasPassed, resultsForUser } from '@/features/quiz/quiz.service';
import { certificatesForUser } from '@/features/certificate/certificate.service';

export interface TrainingFlow {
  reading: ReadingSummary;
  readingComplete: boolean;
  attendedToday: boolean;
  examUnlocked: boolean;
  hasResult: boolean;
  passed: boolean;
  hasCertificate: boolean;
  refresh: () => void;
}

/**
 * Status alur training peserta saat ini (gating terpusat):
 * Materi 100% -> Daftar Hadir hari ini -> Ujian -> Lulus -> Sertifikat.
 * Dipakai Dashboard, Attendance, Ujian, dan Sertifikat.
 */
export function useTrainingFlow(): TrainingFlow {
  const compute = useCallback((): Omit<TrainingFlow, 'refresh'> => {
    const reading = getReadingSummary();
    const user = getCurrentUser();
    const attendedToday = hasAttendedToday();
    const results = user ? resultsForUser(user.id) : [];
    const passed = user ? hasPassed(user.id) : false;
    const certs = user ? certificatesForUser(user.id) : [];
    return {
      reading,
      readingComplete: reading.completed,
      attendedToday,
      examUnlocked: reading.completed && attendedToday,
      hasResult: results.length > 0,
      passed,
      hasCertificate: certs.length > 0,
    };
  }, []);

  const [state, setState] = useState<Omit<TrainingFlow, 'refresh'>>(compute);

  const refresh = useCallback(() => setState(compute()), [compute]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
