const defaultFileSystem = {
    config: {
        name: 'Aishwary Gathe',
        tagline: 'Retro OS Portfolio'
    },
    desktop: [
        {
            id: 'resume',
            name: 'Resume.pdf',
            type: 'file',
            iconImg: 'https://win98icons.alexmeub.com/icons/png/chm-0.png',
            app: 'pdf-reader',
            content: 'assets/AishwaryGathe-updated.pdf'
        },
        {
            id: 'projects',
            name: 'Projects',
            type: 'folder',
            iconImg: 'https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png',
            app: 'explorer',
            content: [
                {
                    id: 'proj1',
                    name: 'CloudLibrary-AWS-ObservaStack',
                    type: 'file',
                    iconImg: 'https://win98icons.alexmeub.com/icons/png/html-0.png',
                    app: 'browser',
                    url: 'https://github.com/AishwaryGathe/CloudLibrary-AWS-ObservaStack'
                },
                {
                    id: 'proj2',
                    name: 'E-Commerce App',
                    type: 'file',
                    iconImg: 'https://win98icons.alexmeub.com/icons/png/html-0.png',
                    app: 'text-viewer',
                    content: '<h3>E-Commerce App</h3><p>A full-stack shopping platform built with React and Node.js.</p>'
                }
            ]
        },
        {
            id: 'videos',
            name: 'My Videos',
            type: 'folder',
            iconImg: 'https://win98icons.alexmeub.com/icons/png/video_file-2.png',
            app: 'explorer',
            content: [
                {
                    id: 'vid1',
                    name: 'Coding Tutorial',
                    type: 'file',
                    iconImg: 'https://win98icons.alexmeub.com/icons/png/media_player_stream_no2-0.png',
                    app: 'browser',
                    url: 'https://www.youtube.com/embed/e-eR1hLLQGg'
                }
            ]
        },
        {
            id: 'github',
            name: 'GitHub',
            type: 'link',
            iconImg: 'https://win98icons.alexmeub.com/icons/png/chm-0.png',
            app: 'browser',
            url: 'https://github.com/AishwaryGathe'
        },
        {
            id: 'settings',
            name: 'Settings',
            type: 'app',
            iconImg: 'https://win98icons.alexmeub.com/icons/png/settings_gear-4.png',
            app: 'settings'
        },
        {
            id: 'game',
            name: 'Tic-Tac-Toe',
            type: 'app',
            iconImg: 'https://win98icons.alexmeub.com/icons/png/game_freecell-0.png',
            app: 'game'
        }
    ]
};
