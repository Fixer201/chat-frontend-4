// Указываем, что компонент является клиентским (Client Component).
// Это необходимо, так как мы используем хук useRouter (свойство состояния/жизненного цикла React).
// Без этого директива все компоненты по умолчанию рендерились бы на сервере (Server Components),

'use client'
// Импорт кнопки из общего UI-кита.
// 'Button' — это переиспользуемый компонент. Использование готовых UI-библиотек (или своих атомарных компонентов)
// ускоряет разработку и обеспечивает консистентность дизайна.
import { Button } from '@shared/ui/button/Button'

// Импорт компонента Image из Next.js.
// Next.js Image автоматически оптимизирует изображения: lazy loading, конвертация в WebP/AVIF,
// предотвращение Cumulative Layout Shift (CLS) за счет обязательных размеров.
import Image from 'next/image'

// Хук для программной навигации.
// В App Router (Next.js 13+) импортируется из 'next/navigation', а не из 'next/router' (как в Pages Router).
// Используем именно его для Soft Navigation (переход без полной перезагрузки страницы).
import { useRouter } from 'next/navigation'

// Экспорт компонента по умолчанию.
// Название StartScreen говорит о том, что это стартовый экран (логин/регистрация).
export default function StartScreen() {
    // Инициализация роутера.
    // Хук работает только внутри компонентов, обернутых в 'use client' (как в нашем случае).
    const router = useRouter()

    // Обработчик клика по кнопке "Начать".
    // router.push() использует клиентский роутер Next.js, что делает переход мгновенным
    // (с предзагрузкой данных) и сохраняет состояние SPA (Single Page Application).
    const handleStartClick = () => {
        router.push('/auth/register')
    }

    return (
        <>
            {/* 
               Внешний контейнер: 
               Flex-расположение по центру. 
               min-h-screen: гарантирует, что блок займет минимум весь экран по высоте (актуально для мобильных с маленьким контентом).
            */}
            <div className="flex min-h-screen items-center justify-center">
                {/* 
                    Основной контейнер-обертка.
                    w-(--app-login-width): Используется произвольное значение CSS переменной.
                    ВНИМАНИЕ: Это хак/зависимость. Если в tailwind.config.js не объявлена переменная 
                    --app-login-width, Tailwind не сможет это обработать. 
                    Лучше было бы добавить это значение в конфиг (например, w-120) или использовать 
                    произвольный класс w-[500px], но это жесткое значение.
                    
                    md:bg-app-login-background: 
                    Mobile-First подход. На мобильных фон прозрачный (bg-none), на десктопе (md) появляется фон.
                    Это сделано для того, чтобы на мобильных был "чистый" экран, а на десктопе — красивая карточка.
                */}
                <div
                    className={`
                      relative flex h-screen w-(--app-login-width) flex-col
                      items-center justify-center bg-none
                      md:bg-app-login-background
                    `}
                >
                    {/* 
                        Внутренний контент.
                        bg-app-login-start: Скорее всего, градиент или картинка для мобильной версии.
                        
                        md:absolute: Критически важный момент верстки.
                        На десктопе мы вырываем блок из потока (absolute), чтобы наложить его поверх фона (bg-app-login-background).
                        На мобильных это обычный flex-контейнер, который занимает весь экран.
                        
                        md:filter-app-start-screen-shadow: Кастомный класс тени. 
    
                    */}
                    <div
                        className={`
                          flex h-screen w-full flex-col items-center
                          justify-center gap-4 bg-white bg-app-login-start
                          md:absolute md:h-190 md:w-122 md:flex-col
                          md:items-center md:justify-center md:rounded-2xl
                          md:filter-app-start-screen-shadow
                        `}
                    >
                        {/* 
                            Логотип.
                            width/height: Обязательные пропсы для next/image. 
                            Если их не указать, будет ошибка.
                            
                            loading="eager":
                            По умолчанию Next.js делает картинки lazy (загружает при скролле).
                            Для главного экрана (Landing/Start Screen) это плохо, так как влияет на LCP (Largest Contentful Paint).
                            Мы явно говорим: "Загрузи эту картинку сразу".
                            
                            className (Mobile):
                            h-[30vh]: Логотип на мобильных занимает 30% от высоты экрана. 
                            max-h-46: Ограничение высоты, чтобы не было слишком огромным.
                            w-[60vw] max-w-53: Ширина зависит от ширины экрана (vw), с ограничением.
                            
                            className (Desktop):
                            md:absolute: Вырываем из потока.
                            md:top-18 md:left-41: Точное позиционирование (скорее всего, дизайн предполагает конкретные отступы).
                            Проблема: Такое позиционирование (цифры 18, 41) очень хрупкое. 

                        */}
                        <Image
                            src="/images/login/Logo.svg"
                            alt="A-Chat"
                            width={179}
                            height={161}
                            className={`
                              h-[30vh] max-h-46 w-[60vw] max-w-53
                              md:absolute md:top-18 md:left-41 md:z-10 md:h-40
                              md:w-45
                            `}
                            loading="eager"
                        />

                        {/* 
                            Блок с текстом и кнопкой.
                            Паттерн аналогичен логотипу: на мобильном — в потоке (flex), на десктопе — абсолютное позиционирование.
                                                    
                            md:h-95 md:w-90: Фиксированные размеры блока на десктопе. 
                            Это может сломать верстку, если текста станет больше (например, при переводе на другой язык).
                        */}
                        <div
                            className={`
                              flex flex-col items-center justify-between gap-4
                              md:absolute md:top-74 md:left-16 md:h-95 md:w-90
                            `}
                        >
                            {/* Обертка для текста */}
                            <div className="flex flex-col items-center gap-6">
                                {/* 
                                    Заголовок "А-Чат".
                                    text-2xl font-bold: Базовая типографика.
                                    
                                    ВНИМАНИЕ: Хардкод.
                                    В реальном проекте текст должен храниться в файлах локализации (i18n), 
                                    например, t('start_screen.title'). Это нужно для перевода приложения на другие языки.
                                */}
                                <span
                                    className={`
                                      text-2xl font-bold text-text-black
                                      md:text-3xl
                                    `}
                                >
                                    А-Чат
                                </span>

                                <div
                                    className={`
                                      flex flex-col gap-1 text-center text-base
                                      text-accent-violet-dark
                                      md:text-lg
                                    `}
                                >
                                    <span>Привет!</span>
                                    <span>
                                        Давай знакомиться!
                                    </span>
                                </div>
                            </div>

                            {/* 
                                Кнопка действия.
                                variant="primary": Стиль кнопки (зависит от дизайн-системы).
                                onClick: Привязка к функции handleStartClick.
                                w-full max-w-75: На мобильных кнопка почти на всю ширину (flex родитель), 
                                но ограничена max-w-75 (около 300px), чтобы не быть слишком огромной на десктопе внутри карточки.
                            */}
                            <Button
                                variant="primary"
                                size="md"
                                className="w-full max-w-75"
                                onClick={handleStartClick}
                            >
                                Начать
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
