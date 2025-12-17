# GoodBoard 🎓

**Tu Blackboard, pero bien hecho.**

GoodBoard es una extensión para Google Chrome diseñada para mejorar significativamente la experiencia de usuario en la plataforma Blackboard (específicamente optimizada para UVM). Transforma la interfaz anticuada en un dashboard moderno, intuitivo y lleno de funcionalidades útiles.

## ✨ Características Principales

- **Dashboard Moderno**: Una interfaz limpia y amigable construida con React.
- **Visualización de Datos**: Gráficos interactivos (usando Recharts) para visualizar tu rendimiento académico y distribución de calificaciones.
- **Gestión de Tareas**: Organiza tus entregas y pendientes de manera eficiente.
- **Integración Perfecta**: Se inyecta directamente en Blackboard para una experiencia fluida.

## 🛠️ Tecnologías Utilizadas

Este proyecto está construido con tecnologías web modernas:

- **[React](https://reactjs.org/)**: Biblioteca para construir interfaces de usuario.
- **[Vite](https://vitejs.dev/)**: Entorno de desarrollo rápido.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework de CSS para un diseño rápido y responsivo.
- **[Recharts](https://recharts.org/)**: Biblioteca de gráficos para React.
- **[Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)**: El estándar más reciente para extensiones de Chrome.

## 🚀 Instalación y Desarrollo

### Prerrequisitos

- Node.js (versión 16 o superior recomendada)
- npm

### Configuración del Proyecto

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/Dexterpol-A21/goodBoard.git
    cd goodBoard
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Construye el proyecto:
    ```bash
    npm run build
    ```

### Cargar en Chrome (Modo Desarrollador)

1.  Abre Google Chrome y ve a `chrome://extensions/`.
2.  Activa el **"Modo de desarrollador"** en la esquina superior derecha.
3.  Haz clic en **"Cargar descomprimida"**.
4.  Selecciona la carpeta `dist` generada en el paso de construcción.

¡Listo! La extensión debería estar activa cuando visites Blackboard.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras.

## 👤 Autor

**Dexterpol-A21**
- GitHub: [@Dexterpol-A21](https://github.com/Dexterpol-A21)
- Portfolio: [dexterpol-a21.github.io](https://dexterpol-a21.github.io)

---
*Este proyecto no está afiliado oficialmente con Blackboard ni UVM.*
