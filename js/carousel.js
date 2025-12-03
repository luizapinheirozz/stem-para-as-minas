document.addEventListener("DOMContentLoaded", () => {
  // Inicializar primeiro carrossel (Sobre Equipe)
  initCarousel('.sobre-equipe__carousel', {
    wrapper: '.sobre-equipe__carousel-wrapper',
    list: '.sobre-equipe__list',
    items: '.sobre-equipe__item',
    prev: '.sobre-equipe__arrow--prev',
    next: '.sobre-equipe__arrow--next'
  });

  // Inicializar segundo carrossel (Pesquisa Depoimentos)
  initCarousel('.pesquisa-depoimentos__carousel', {
    wrapper: '.pesquisa-depoimentos__carousel-wrapper',
    list: '.pesquisa-depoimentos__list',
    items: '.pesquisa-depoimentos__item',
    prev: '.pesquisa-depoimentos__arrow--prev',
    next: '.pesquisa-depoimentos__arrow--next'
  });

  function initCarousel(carouselSelector, elements) {
    const carousel = document.querySelector(carouselSelector);
    if (!carousel) return;

    const wrapper = carousel.querySelector(elements.wrapper);
    const list = carousel.querySelector(elements.list);
    const items = carousel.querySelectorAll(elements.items);
    const prevButton = carousel.querySelector(elements.prev);
    const nextButton = carousel.querySelector(elements.next);

    if (!wrapper || !list || items.length === 0 || !prevButton || !nextButton) {
      console.warn(`Carrossel ${carouselSelector} ignorado: elementos faltando`);
      return;
    }

    let currentIndex = 0;
    let itemsPerView = 1;
    let maxIndex = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let transform = 0;
    let minTransform = 0;
    let isTransitionEnabled = true;

    // Configurar acessibilidade
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-label', 'Carrossel');
    list.setAttribute('role', 'list');

    // Calcular itens por visualização
    function calculateItemsPerView() {
      const firstItem = items[0];
      if (!firstItem) return 1;

      const itemWidth = firstItem.offsetWidth;
      const wrapperWidth = wrapper.clientWidth;
      const gap = getGap();

      if (itemWidth === 0) return 1;

      const itemsPerViewCalc = Math.floor((wrapperWidth + gap) / (itemWidth + gap));
      return Math.max(1, itemsPerViewCalc);
    }

    // Obter gap do CSS
    function getGap() {
      const styles = getComputedStyle(list);
      const gap = styles.gap || styles.columnGap;
      return parseInt(gap) || 0;
    }

    // Atualizar carrossel
    function updateCarousel(animate = true) {
      itemsPerView = calculateItemsPerView();
      maxIndex = Math.max(0, items.length - itemsPerView);
      
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      const itemWidth = items[0].offsetWidth;
      const gap = getGap();
      const translateX = -currentIndex * (itemWidth + gap);

      if (animate) {
        list.style.transition = 'transform 0.5s ease';
      } else {
        list.style.transition = 'none';
      }

      list.style.transform = `translateX(${translateX}px)`;

      // Atualizar estados dos botões
      updateButtonsState();
      
      // Atualizar acessibilidade
      updateAriaLabels();
    }

    // Atualizar estados dos botões
    function updateButtonsState() {
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex >= maxIndex;
      
      prevButton.setAttribute('aria-disabled', currentIndex === 0);
      nextButton.setAttribute('aria-disabled', currentIndex >= maxIndex);
    }

    // Atualizar labels de acessibilidade
    function updateAriaLabels() {
      items.forEach((item, index) => {
        item.setAttribute('aria-hidden', index < currentIndex || index >= currentIndex + itemsPerView);
        item.setAttribute('aria-label', `Item ${index + 1} de ${items.length}`);
      });
    }

    // Navegar para anterior
    function goToPrev() {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    }

    // Navegar para próximo
    function goToNext() {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    }

    // Event Listeners para navegação
    prevButton.addEventListener('click', goToPrev);
    nextButton.addEventListener('click', goToNext);

    // Event Listeners para touch/swipe
    list.addEventListener('touchstart', handleTouchStart, { passive: true });
    list.addEventListener('touchmove', handleTouchMove, { passive: true });
    list.addEventListener('touchend', handleTouchEnd);

    // Event Listeners para mouse drag
    list.addEventListener('mousedown', handleMouseDown);
    list.addEventListener('mousemove', handleMouseMove);
    list.addEventListener('mouseup', handleMouseUp);
    list.addEventListener('mouseleave', handleMouseLeave);

    function handleTouchStart(e) {
      isDragging = true;
      startX = e.touches[0].clientX;
      currentX = startX;
      isTransitionEnabled = false;
      list.style.transition = 'none';
    }

    function handleTouchMove(e) {
      if (!isDragging) return;
      
      e.preventDefault();
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      
      const itemWidth = items[0].offsetWidth;
      const gap = getGap();
      const baseTranslate = -currentIndex * (itemWidth + gap);
      const dragTranslate = baseTranslate + diff;
      
      // Limitar arrasto
      const maxDrag = 0;
      const minDrag = -maxIndex * (itemWidth + gap);
      
      if (dragTranslate > maxDrag) {
        transform = maxDrag - (maxDrag - dragTranslate) * 0.3;
      } else if (dragTranslate < minDrag) {
        transform = minDrag + (dragTranslate - minDrag) * 0.3;
      } else {
        transform = dragTranslate;
      }
      
      list.style.transform = `translateX(${transform}px)`;
    }

    function handleTouchEnd() {
      if (!isDragging) return;
      
      isDragging = false;
      isTransitionEnabled = true;
      list.style.transition = 'transform 0.3s ease';
      
      const diff = currentX - startX;
      const threshold = items[0].offsetWidth / 4;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentIndex > 0) {
          currentIndex--;
        } else if (diff < 0 && currentIndex < maxIndex) {
          currentIndex++;
        }
      }
      
      updateCarousel();
    }

    function handleMouseDown(e) {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      currentX = startX;
      isTransitionEnabled = false;
      list.style.transition = 'none';
      list.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
      if (!isDragging) return;
      
      currentX = e.clientX;
      const diff = currentX - startX;
      
      const itemWidth = items[0].offsetWidth;
      const gap = getGap();
      const baseTranslate = -currentIndex * (itemWidth + gap);
      const dragTranslate = baseTranslate + diff;
      
      // Limitar arrasto
      const maxDrag = 0;
      const minDrag = -maxIndex * (itemWidth + gap);
      
      if (dragTranslate > maxDrag) {
        transform = maxDrag - (maxDrag - dragTranslate) * 0.3;
      } else if (dragTranslate < minDrag) {
        transform = minDrag + (dragTranslate - minDrag) * 0.3;
      } else {
        transform = dragTranslate;
      }
      
      list.style.transform = `translateX(${transform}px)`;
    }

    function handleMouseUp() {
      if (!isDragging) return;
      
      isDragging = false;
      isTransitionEnabled = true;
      list.style.transition = 'transform 0.3s ease';
      list.style.cursor = 'grab';
      
      const diff = currentX - startX;
      const threshold = items[0].offsetWidth / 4;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentIndex > 0) {
          currentIndex--;
        } else if (diff < 0 && currentIndex < maxIndex) {
          currentIndex++;
        }
      }
      
      updateCarousel();
    }

    function handleMouseLeave() {
      if (isDragging) {
        handleMouseUp();
      }
    }

    // Acessibilidade por teclado
    carousel.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          updateCarousel();
          break;
        case 'End':
          e.preventDefault();
          currentIndex = maxIndex;
          updateCarousel();
          break;
      }
    });

    // Inicializar
    updateCarousel(false);
    
    // Atualizar no resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateCarousel(false);
      }, 150);
    });
  }
});