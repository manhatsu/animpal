import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

// アップロードされた画像を保存するディレクトリ
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'ファイル名が指定されていません' },
        { status: 400 }
      );
    }

    const filePath = join(UPLOAD_DIR, fileName);

    try {
      await unlink(filePath);
      return NextResponse.json({ 
        success: true,
        message: 'ファイルを削除しました'
      });
    } catch (error) {
      console.error('ファイル削除エラー:', error);
      return NextResponse.json(
        { error: 'ファイルの削除に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('リクエスト処理エラー:', error);
    return NextResponse.json(
      { error: 'リクエストの処理に失敗しました' },
      { status: 500 }
    );
  }
} 