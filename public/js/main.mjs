import { initNavigation } from './modules/navigation.mjs';

function bootstrap() {
    initNavigation();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}