-- Supabase Storage 설정 스크립트
-- Supabase Dashboard의 Storage 섹션에서 실행하거나 SQL Editor에서 실행

-- 1. blog-assets 버킷 생성 (이미 존재하면 건너뜀)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-assets', 'blog-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. blog-assets 버킷에 대한 RLS 정책 설정
-- 모든 사용자가 읽기 가능하도록 설정
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-assets');

-- 인증된 사용자만 업로드 가능하도록 설정
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-assets' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자만 업데이트 가능하도록 설정
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'blog-assets' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자만 삭제 가능하도록 설정
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'blog-assets' 
  AND auth.role() = 'authenticated'
);

-- 3. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ blog-assets 버킷이 생성되었습니다.';
  RAISE NOTICE '✅ Storage RLS 정책이 설정되었습니다.';
  RAISE NOTICE '✅ 이제 이미지 업로드가 가능합니다.';
END $$; 