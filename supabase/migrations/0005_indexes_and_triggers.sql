-- =============================================================================
-- 0005 — Indexes & Triggers
-- =============================================================================

-- --- Indexes (selain unique constraint yang sudah otomatis ter-index) --------
create index if not exists idx_users_position on public.users (position_id);
create index if not exists idx_users_location on public.users (location_id);

create index if not exists idx_material_blocks_chapter
  on public.material_blocks (chapter_id, order_no);

create index if not exists idx_attendance_user_date
  on public.attendance (user_id, attend_date);
create index if not exists idx_attendance_location on public.attendance (location_id);
create index if not exists idx_attendance_position on public.attendance (position_id);

create index if not exists idx_questions_active
  on public.questions (training_key, is_active);
create index if not exists idx_question_options_question
  on public.question_options (question_id);

create index if not exists idx_quiz_result_user
  on public.quiz_result (user_id, created_at desc);
create index if not exists idx_quiz_answers_result
  on public.quiz_answers (quiz_result_id);

create index if not exists idx_certificates_number
  on public.certificates (certificate_number);
create index if not exists idx_certificates_user on public.certificates (user_id);

-- --- Triggers: auto updated_at ----------------------------------------------
drop trigger if exists trg_company_settings_updated_at on public.company_settings;
create trigger trg_company_settings_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_training_progress_updated_at on public.training_progress;
create trigger trg_training_progress_updated_at
  before update on public.training_progress
  for each row execute function public.set_updated_at();
