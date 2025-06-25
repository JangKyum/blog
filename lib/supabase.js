import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경변수 유효성 검사
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경변수가 설정되지 않았습니다.\n' +
    '.env.local 파일에 다음 값들을 설정해주세요:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key'
  )
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const auth = {
  // 이메일로 로그인
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // 세션 정보 가져오기
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // 인증 상태 변화 감지
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// 이미지 업로드 관련 유틸리티
export const storage = {
  // 이미지 파일 업로드
  uploadImage: async (file, folder = 'blog-images') => {
    try {
      // 파일 이름 생성 (타임스탬프 + 원본 파일명)
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // 파일 업로드
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // 공개 URL 생성
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return {
        success: true,
        url: publicUrl,
        path: filePath,
        error: null
      }
    } catch (error) {
      return {
        success: false,
        url: null,
        path: null,
        error: error.message
      }
    }
  },

  // 이미지 삭제
  deleteImage: async (filePath) => {
    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([filePath])

      if (error) {
        throw error
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 이미지 파일 유효성 검사
  validateImageFile: (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '지원되지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 지원)'
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: '파일 크기가 너무 큽니다. (최대 5MB)'
      }
    }

    return { valid: true, error: null }
  }
} 