/**
 * 设置动画和交互效果
 */
export function setupAnimations() {
    // 为按钮添加涟漪效果
    addRippleEffect();

    // 添加滚动动画
    addScrollAnimation();

    // 将模块实例保存到全局app对象
    window.app.modules.animations = {
        createRipple,
        addRippleEffect,
        addScrollAnimation
    };
}

/**
 * 为按钮添加涟漪效果
 */
function addRippleEffect() {
    const rippleButtons = document.querySelectorAll('.upload-btn, .copy-all-btn, .top-action-btn');
    rippleButtons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
}

/**
 * 创建涟漪效果
 * @param {Event} event - 点击事件对象
 */
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // 计算相对位置
    const rect = button.getBoundingClientRect();
    const left = event.clientX - rect.left - radius;
    const top = event.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${left}px`;
    circle.style.top = `${top}px`;
    circle.classList.add('ripple');

    // 移除之前的涟漪
    const ripple = button.querySelector('.ripple');
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);

    // 动画完成后移除
    setTimeout(() => {
        if (circle) {
            circle.remove();
        }
    }, 600);
}

/**
 * 添加滚动动画
 */
function addScrollAnimation() {
    const animateOnScroll = document.querySelectorAll('.upload-container, .url-results-container, .preview-sidebar');
    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animateOnScroll.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            scrollObserver.observe(el);
        });
    }
}
