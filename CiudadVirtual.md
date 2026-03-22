**City Builder Game** es un simulador urbano donde los jugadores asumen
el rol de **alcalde** de una ciudad virtual. El objetivo principal es
construir, desarrollar y gestionar una ciudad próspera mediante la
construcción de infraestructura, gestión de recursos, planificación
urbana y atención a las necesidades de los ciudadanos.

El sistema abarca los siguientes aspectos del dominio urbano:

-   **Planificación territorial**: Diseño y organización del espacio
    urbano

-   **Construcción**: Edificación de diferentes tipos de estructuras

-   **Gestión de recursos**: Administración de dinero, electricidad,
    agua y alimentos

-   **Población**: Simulación de ciudadanos con necesidades y
    comportamientos

-   **Economía urbana**: Generación de ingresos, empleos y costos
    operativos

-   **Servicios públicos**: Provisión de energía, agua y recreación

-   **Factores externos**: Integración con datos climáticos y noticias
    de la realidad

Actores del Sistema
===================

1.  **Jugador/Alcalde**

> **Definición**: Usuario humano que interactúa con el sistema para
> gestionar una ciudad virtual.
>
> **Responsabilidades**:

-   Crear y nombrar su ciudad

-   Construir y demoler edificios y vías

-   Gestionar recursos económicos y naturales

-   Tomar decisiones estratégicas sobre el desarrollo urbano

-   Monitorear el bienestar de los ciudadanos

-   Planificar rutas de transporte

2.  **Ciudadano (Entidad Simulada)**

> **Definición**: Habitante virtual de la ciudad que responde
> dinámicamente a las condiciones urbanas.
>
> **Características**:

-   Identificador único

-   Nivel de felicidad (0-100)

> **Necesidades**:

-   Vivienda

-   Empleo

-   Servicios públicos (salud, seguridad)

-   Recursos básicos

    -   Agua (-X por turno)

    -   Electricidad (-Y por turno)

    -   Comida (-Z por turno)

> **Nota: Los valores de X,Y,Z pueden ser configurables desde una caja
> de texto**

-   Recreación

Conceptos Fundamentales del Dominio
===================================

1.  **Ciudad (City)**

> **Definición**: Entidad principal que representa el espacio urbano
> completo gestionado por el jugador.
>
> **Atributos**:

-   Nombre de la ciudad

-   Región geográfica : Nombre de una ciudad real de Colombia
    > (coordenadas latitud/longitud), esta puede ser accedida desde
    > <https://api-colombia.com/>

-   Tamaño del mapa (ancho × alto, entre 15×15 hasta 30×30)

-   Turno actual

-   Puntuación acumulada

> **Composición**:

-   Mapa/Grid bidimensional

-   Colección de edificios

-   Red de vías/caminos

-   Población de ciudadanos

-   Estado de recursos

    1.  **Mapa/Grid**

**Definición**: Matriz bidimensional que representa el territorio
disponible para la construcción.

**Características**:

-   Dimensiones configurables (mínimo 15×15 hasta máximo 30×30)

-   Cada celda puede estar:

    -   Vacía (terreno sin uso)

    -   Ocupada por un edificio

    -   Ocupada por una vía

**Representación**:

-   Sistema de coordenadas (x, y) donde (0,0) es la esquina superior
    izquierda

-   Convenciones textuales para carga de mapas:

    -   g = terreno vacío (grass)

    -   r = vía (road)

    -   R1, R2 = edificios residenciales

    -   C1, C2 = edificios comerciales

    -   I1, I2 = edificios industriales

    -   S1, S2, S3 = edificios de servicio

    -   U1, U2 = plantas de utilidad

    -   P1 = parque

    1.  **Edificios (Buildings)**

**Definición**: Estructuras construibles que ocupan una celda del mapa y
cumplen funciones específicas.

A.  **Edificios Residenciales (Residential Buildings)**

> **Propósito**: Proveer vivienda para ciudadanos.
>
> **Tipos**:

  **Tipo**      **Capacidad**   **Costo**   **Consumo Electricidad**   **Consumo Agua**
  ------------- --------------- ----------- -------------------------- -------------------
  Casa          4 ciudadanos    \$1,000     5 unidades/turno           3 unidades/turno
  Apartamento   12 ciudadanos   \$3,000     15 unidades/turno          10 unidades/turno

> **Comportamiento**:

-   Albergan ciudadanos hasta su capacidad máxima

-   Contribuyen al crecimiento poblacional

-   Afectan la felicidad de sus habitantes

B.  **Edificios Comerciales (Commercial Buildings)**

> **Propósito**: Generar ingresos económicos y ofrecer empleos.
>
> **Tipos**:

  **Tipo**           **Empleos**   **Costo**   **Ingreso/Turno**   **Consumo Electricidad**
  ------------------ ------------- ----------- ------------------- --------------------------
  Tienda             6             \$2,000     \$500               8 unidades/turno
  Centro Comercial   20            \$8,000     \$2,000             25 unidades/turno

> **Comportamiento**:

-   Requieren electricidad para funcionar

-   Sin electricidad: no generan ingresos

-   Emplean ciudadanos disponibles

C.  **Edificios Industriales (Industrial Buildings)**

> **Propósito**: Producir recursos y ofrecer empleos.
>
> **Tipos**:

  **Tipo**   **Empleos**   **Costo**   **Producción**       **Consumo**
  ---------- ------------- ----------- -------------------- ---------------------------------------
  Fábrica    15            \$5,000     \$800/turno          Electricidad (20 u/t) + Agua (15 u/t)
  Granja     8             \$3,000     50 alimentos/turno   Agua (10 u/t)

D.  **Edificios de Servicio (Service Buildings)**

> **Propósito**: Aumentar felicidad de ciudadanos en su área de
> influencia.
>
> **Tipos**:

  **Tipo**               **Costo**   **Radio**   **Beneficio**   **Consumo**
  ---------------------- ----------- ----------- --------------- ---------------------------------------
  Estación de Policía    \$4,000     5 celdas    +10 felicidad   Electricidad (15 u/t)
  Estación de Bomberos   \$4,000     5 celdas    +10 felicidad   Electricidad (15 u/t)
  Hospital               \$6,000     7 celdas    +10 felicidad   Electricidad (20 u/t) + Agua (10 u/t)

> **Nota los valores de beneficio pueden ser configurables desde cajas
> de texto**
>
> **Comportamiento**:

-   Aumentan la felicidad de todos los habitantes

E.  **Plantas de Utilidad (Utility Plants)**

> **Propósito**: Generar recursos esenciales para el funcionamiento
> urbano.
>
> **Tipos**:

  **Tipo**           **Costo**   **Producción**       **Consumo**
  ------------------ ----------- -------------------- -----------------------
  Planta Eléctrica   \$10,000    200 unidades/turno   Ninguno
  Planta de Agua     \$8,000     150 unidades/turno   20 electricidad/turno

> **Comportamiento**:

-   Producción fija por turno

-   La planta de agua depende de electricidad para funcionar

F.  **Parques (Parks)**

> **Propósito**: Aumentar felicidad mediante áreas recreativas.
>
> **Características**:

-   Costo: \$1,500

-   Beneficio: +5 felicidad para todos los habitantes

-   No consumen recursos

G.  **Vías/Caminos (Roads)**

> **Definición**: Infraestructura de conectividad que permite el
> tránsito entre edificios.
>
> **Características**:

-   Costo por celda: \$100

-   No consumen recursos operativos

> **Función**:

-   Conectar edificios, ya que no se puede construir un edificio si no
    > tiene una vía adyacente

    1.  **Recursos (Resources)**

**Definición**: Elementos cuantificables necesarios para el
funcionamiento de la ciudad.

A.  **Dinero (Money)**

-   **Inicial**: \$50,000

-   **Puede ser aumentado por**: Edificios comerciales e industriales
    (fábricas)

-   **Consumido por**: Construcción y mantenimiento

B.  **Electricidad (Electricity)**

-   **Inicial**: 0 (debe construirse plantas), pero este valor puede ser
    configurable desde una caja de texto y puede ser cambiado en
    cualquier momento del juego

-   **Unidad**: unidades/turno

-   **Generado por**: Plantas eléctricas

-   **Consumido por**: Todos los edificios excepto parques

-   **Si la energía llega en un momento a ser negativa se termina el
    juego**

C.  **Agua (Water)**

-   **Inicial**: 0 (debe construirse plantas), pero este valor puede ser
    configurable desde una caja de texto y puede ser cambiado en
    cualquier momento del juego

```{=html}
<!-- -->
```
-   **Unidad**: unidades/turno

-   **Generado por**: Plantas de agua

-   **Consumido por**: Edificios residenciales, industriales, hospitales
    y demás edificios

-   **Balance negativo**: En caso de ser negativo se termina el juego

D.  **Alimentos (Food)**

-   **Inicial**: 0, pero este valor puede ser configurable desde una
    caja de texto y puede ser cambiado en cualquier momento del juego

```{=html}
<!-- -->
```
-   **Unidad**: unidades acumulables

-   **Generado por**: Granjas

-   **Consumido por**: Ciudadanos (consumo indirecto vía felicidad)

-   **Impacto**: Alimentos suficientes aumentan felicidad

Sistema de Turnos (Turn-Based System)
=====================================

**Definición**: Ciclo temporal que estructura la evolución de la ciudad.

**Duración**: 1 turno = X segundos (tiempo real), puede ser configurado
en una caja de texto

**Acciones por turno**:

1.  Cálculo de producción de recursos

2.  Cálculo de consumo de recursos

3.  Aplicación de costos de mantenimiento

4.  Actualización de felicidad de ciudadanos

5.  Actualización de puntuación

6.  Guardado automático en LocalStorage

Sistema de Ciudadanos (Citizens System)
=======================================

**Definición**: Simulación de población urbana con comportamiento
autónomo.

**Creación de Ciudadanos**

**Condiciones**:

Se crean automáticamente en cada "turno" si se cumplen las siguientes
condiciones

-   Hay viviendas disponibles (capacidad residencial \> población
    actual)

-   Felicidad promedio de la ciudad \> 60

-   Hay empleos disponibles

> **Tasa de crecimiento**: 1-3 ciudadanos por turno si se cumplen
> condiciones, este valor es parametrizable

**Asignación Automática**

-   **Vivienda**: Asignación a edificios residenciales con capacidad

-   **Empleo**: Asignación a edificios comerciales/industriales con
    vacantes

**Cálculo de Felicidad Individual**

Fórmula base:

felicidad =factores\_positivos - factores\_negativos

**Factores positivos**:

-   Tiene vivienda: +20

-   Tiene empleo: +15

-   Parques, hospitales, estaciones de policía según su valor

**Factores negativos**:

-   Sin vivienda: -20

-   Sin empleo: -15

Sistema de Puntuación (Scoring System)
======================================

**Definición**: Métrica cuantitativa del desempeño del jugador como
alcalde.

**Fórmula**:

score = (población × 10) +

(felicidad\_promedio × 5) +

(dinero ÷ 100) +

(número\_edificios × 50) +

(balance\_electricidad × 2) +

(balance\_agua × 2) +

bonificaciones - penalizaciones

**Bonificaciones**

-   Todos los ciudadanos empleados: +500

-   Felicidad \> 80: +300

-   Todos los recursos positivos: +200

-   Ciudad \> 1,000 habitantes: +1,000

**Penalizaciones**

-   Dinero negativo: -500

-   Electricidad negativa: -300

-   Agua negativa: -300

-   Felicidad \< 40: -400

-   Por cada ciudadano desempleado: -10

Sistema de Rutas (Routing System)
=================================

**Definición**: Mecanismo para calcular caminos óptimos entre edificios
utilizando la red de vías.

**Algoritmo**: Dijkstra (implementado en backend)

**Proceso**:

1.  El jugador selecciona edificio de origen

2.  El jugador selecciona edificio de destino

3.  El sistema genera matriz del mapa:

    -   0 = celda no transitable (edificios, terreno vacío)

    -   1 = celda transitable (vías)

4.  Se envía petición POST al backend: /api/calculate-route

5.  El backend retorna array de coordenadas representando la ruta

6.  El frontend anima la ruta en el mapa

**Casos especiales**:

-   Sin ruta disponible: mensaje de error

-   Edificios no conectados por vías: imposible calcular

Integraciones Externas
======================

A.  **API del Clima (OpenWeatherMap)**

> **Propósito**: Obtener datos meteorológicos reales de la región de la
> ciudad.
>
> **Endpoint**: GET
> https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}
>
> **Frecuencia de actualización**: Cada 30 minutos
>
> **Datos obtenidos**:

-   Temperatura (°C)

-   Condición climática (soleado, lluvioso, nublado, tormenta)

-   Humedad (%)

-   Velocidad del viento (km/h)

    A.  **API de Noticias (NewsAPI)**

> **Propósito**: Integrar noticias reales de la región para inmersión.
>
> **Endpoint**: GET https://newsapi.org/v2/top-headlines?country={code}
>
> **Frecuencia de actualización**: Cada 30 minutos
>
> **Datos obtenidos**:

-   Últimas 5 noticias

-   Título

-   Descripción breve

-   Imagen (si disponible)

-   Enlace a noticia completa

Reglas del Dominio
==================

A.  **Reglas de Construcción**

```{=html}
<!-- -->
```
1.  **Exclusividad espacial**: Una celda no puede estar ocupada por más
    de un elemento (edificio o vía)

2.  **Restricción presupuestaria**: No se puede construir si el costo
    excede el dinero disponible

3.  **Adyacencia obligatoria**: Los edificios deben estar al lado de
    vías adyacentes

4.  **Límite territorial**: El tamaño del mapa es fijo (configurado en
    creación), no se puede expandir

```{=html}
<!-- -->
```
B.  **Reglas de Población**

```{=html}
<!-- -->
```
1.  **Capacidad residencial**: Ciudadanos no pueden exceder la suma de
    capacidades de edificios residenciales

2.  **Requisitos de crecimiento**:

    -   Capacidad de vivienda disponible

    -   Felicidad promedio \> 60

    -   Empleos disponibles

3.  **Asignación automática**: Ciudadanos sin hogar/empleo se asignan
    automáticamente si hay disponibilidad

```{=html}
<!-- -->
```
C.  **Reglas de Rutas**

```{=html}
<!-- -->
```
1.  **Transitabilidad**: Solo las vías son transitables

2.  **Existencia de camino**: Si no hay secuencia de vías conectando
    origen y destino, no hay ruta

3.  **Optimalidad**: El algoritmo siempre retorna la ruta de menor
    distancia

```{=html}
<!-- -->
```
D.  **Reglas de Persistencia**

```{=html}
<!-- -->
```
1.  **Guardado automático**: Cada 30 segundos

2.  **Guardado en LocalStorage**: Toda la ciudad se serializa a JSON

3.  **Exportación opcional**: El jugador puede exportar manualmente a
    > archivo JSON

Historias de Usuario - City Builder Game
========================================

**Épicas del Proyecto**

**Épica 1: Configuración y Gestión de Ciudad**

Como jugador, quiero crear y configurar mi ciudad para comenzar a
construir mi imperio urbano.

**Épica 2: Construcción y Desarrollo Urbano**

Como jugador, quiero construir edificios y vías para desarrollar mi
ciudad y hacerla crecer.

**Épica 3: Gestión de Recursos y Población**

Como jugador, quiero gestionar recursos y ciudadanos para mantener mi
ciudad funcionando eficientemente.

**Épica 4: Planificación y Rutas**

Como jugador, quiero planificar rutas óptimas entre edificios para
optimizar el transporte en mi ciudad.

**Épica 5: Información Contextual**

Como jugador, quiero ver información del clima y noticias de mi región
para una experiencia más inmersiva.

**Épica 6: Competencia y Ranking**

Como jugador, quiero ver mi puntuación y competir en un ranking para
motivarme a mejorar mi ciudad.

**Historias de Usuario Detalladas**

**HU-001: Creación de Nueva Ciudad**

**Como** jugador nuevo\
**Quiero** crear una ciudad ingresando sus datos básicos\
**Para** comenzar a jugar y construir mi imperio urbano

**Criterios de Aceptación:**

-   \[ \] El sistema muestra un formulario con los siguientes campos
    obligatorios:

    -   Nombre de la ciudad (texto, máx 50 caracteres)

    -   Nombre del alcalde/jugador (texto, máx 50 caracteres)

    -   Región geográfica (selección de ciudad o coordenadas lat/lon)

    -   Tamaño del mapa (selector entre 15x15 y 30x30)

-   \[ \] El sistema valida que todos los campos estén completos antes
    de continuar

-   \[ \] El sistema valida que el tamaño del mapa esté dentro del rango
    permitido

-   \[ \] Al confirmar, el sistema crea una ciudad vacía con recursos
    iniciales:

    -   Dinero: \$50,000

    -   Electricidad: 0 (debe construir plantas)

    -   Agua: 0 (debe construir plantas)

    -   Población: 0

-   \[ \] El sistema redirige automáticamente a la vista principal del
    juego

-   \[ \] El sistema guarda la configuración inicial en LocalStorage

**Prioridad:** Alta\
**Dependencias:** Ninguna

**HU-002: Cargar Mapa desde Archivo de Texto**

**Como** jugador\
**Quiero** cargar un mapa prediseñado desde un archivo de texto\
**Para** comenzar con una ciudad ya estructurada

**Criterios de Aceptación:**

-   \[ \] El sistema muestra un botón \"Cargar Mapa\" en la pantalla de
    configuración

-   \[ \] Al hacer click, se abre un selector de archivos que acepta
    archivos .txt

-   \[ \] El sistema valida que el archivo tenga el formato correcto:

-   \[ \] El sistema parsea correctamente las convenciones del mapa (g,
    r, R1, C1, I1, S1, etc.)

-   \[ \] El sistema crea instancias de Building para cada edificio en
    el mapa

-   \[ \] El sistema crea instancias de Road para cada celda de vía

-   \[ \] El sistema calcula recursos iniciales basándose en los
    edificios existentes

-   \[ \] Si el archivo tiene errores de formato, muestra mensaje de
    error específico

-   \[ \] El mapa cargado se renderiza correctamente en la interfaz

-   \[ \] El sistema guarda el estado cargado en LocalStorage

**Prioridad:** Alta\
**Dependencias:** HU-001

**HU-003: Construir Edificio Residencial**

**Como** jugador\
**Quiero** construir casas y apartamentos\
**Para** aumentar la capacidad de población de mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema muestra un menú de construcción con tipos de
    edificios residenciales:

    -   Casa (capacidad: 4, costo: \$1,000)

    -   Apartamento (capacidad: 12, costo: \$3,000)

-   \[ \] Al seleccionar un tipo, el cursor cambia para indicar modo
    construcción

-   \[ \] Al hacer click en una celda vacía, el sistema valida:

    -   La celda está vacía (no hay otro edificio)

    -   Hay suficiente dinero para construir

    -   **Obligatorio**: Hay una vía adyacente

-   \[ \] Si la validación pasa:

    -   Se descuenta el costo del dinero disponible

    -   Se renderiza el edificio en el mapa

    -   Se muestra notificación de éxito

-   \[ \] Si la validación falla, se muestra mensaje de error específico

-   \[ \] El sistema actualiza el contador de edificios residenciales

-   \[ \] El edificio consume electricidad y agua (si están disponibles)

**Prioridad:** Alta\
**Dependencias:** HU-001

**HU-004: Construir Edificio Comercial**

**Como** jugador\
**Quiero** construir tiendas y centros comerciales\
**Para** generar ingresos y empleos en mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema muestra tipos de edificios comerciales:

    -   Tienda (empleos: 6, costo: \$2,000)

    -   Centro Comercial (empleos: 20, costo: \$8,000)

-   \[ \] El proceso de construcción sigue el mismo flujo que HU-003

-   \[ \] El edificio comercial genera dinero por turno:

    -   Tienda: \$500/turno

    -   Centro Comercial: \$2,000/turno

-   \[ \] El edificio comercial consume electricidad

-   \[ \] El edificio comercial ofrece empleos a los ciudadanos

-   \[ \] El sistema muestra el ingreso generado en el panel de
    estadísticas

-   \[ \] Si no hay electricidad, el edificio no genera dinero

**Prioridad:** Alta\
**Dependencias:** HU-001, HU-003

**HU-005: Construir Edificio Industrial**

**Como** jugador\
**Quiero** construir fábricas y granjas\
**Para** producir recursos y empleos

**Criterios de Aceptación:**

-   \[ \] El sistema muestra tipos de edificios industriales:

    -   Fábrica (empleos: 15, costo: \$5,000, produce: dinero)

    -   Granja (empleos: 8, costo: \$3,000, produce: alimentos)

-   \[ \] La fábrica genera dinero por turno: \$800/turno

-   \[ \] La fábrica consume agua y electricidad

-   \[ \] La granja produce alimentos: +50 unidades/turno

-   \[ \] La granja consume agua

-   \[ \] Los edificios industriales ofrecen empleos

-   \[ \] Si faltan recursos (agua/electricidad), la producción se
    reduce al 50%

**Prioridad:** Alta\
**Dependencias:** HU-001

**HU-006: Construir Edificios de Servicio**

**Como** jugador\
**Quiero** construir policía, bomberos y hospitales\
**Para** aumentar la felicidad de los ciudadanos

**Criterios de Aceptación:**

-   \[ \] El sistema muestra tipos de edificios de servicio:

    -   Estación de Policía (costo: \$4,000, radio: 5 celdas)

    -   Estación de Bomberos (costo: \$4,000, radio: 5 celdas)

    -   Hospital (costo: \$6,000, radio: 7 celdas)

-   \[ \] Cada edificio de servicio consume electricidad

-   \[ \] Los edificios de servicio aumentan felicidad a toda la ciudad:

    -   Policía: +10 felicidad

    -   Bomberos: +10 felicidad

    -   Hospital: +10 felicidad

-   \[ \] El hospital consume también agua

**Prioridad:** Media\
**Dependencias:** HU-001, HU-013

**HU-007: Construir Plantas de Utilidad**

**Como** jugador\
**Quiero** construir plantas eléctricas y de agua\
**Para** proveer recursos esenciales a mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema muestra tipos de utilidades:

    -   Planta Eléctrica (costo: \$10,000, produce: 200 unidades/turno)

    -   Planta de Agua (costo: \$8,000, produce: 150 unidades/turno)

-   \[ \] La planta eléctrica no consume recursos

-   \[ \] La planta de agua consume 20 unidades de electricidad/turno

-   \[ \] El sistema muestra producción total en panel de recursos

-   \[ \] El sistema muestra balance (producción - consumo) para cada
    recurso

**Prioridad:** Alta\
**Dependencias:** HU-001

**HU-008: Construir Parques**

**Como** jugador\
**Quiero** construir parques\
**Para** aumentar la felicidad de los ciudadanos cercanos

**Criterios de Aceptación:**

-   \[ \] El sistema permite construir parques (costo: \$1,500)

-   \[ \] Los parques no consumen recursos

-   \[ \] Los parques aumentan felicidad +5 puntos a todos los
    ciudadanos

-   \[ \] Los parques no tienen capacidad ni empleos

-   \[ \] Se puede construir múltiples parques

**Prioridad:** Baja\
**Dependencias:** HU-001, HU-013

**HU-009: Construir Vías/Caminos**

**Como** jugador\
**Quiero** construir vías entre edificios\
**Para** conectar mi ciudad y permitir rutas de transporte

**Criterios de Aceptación:**

-   \[ \] El sistema muestra opción \"Construir Vía\" en menú de
    construcción

-   \[ \] Al seleccionar, el modo cambia a construcción de vías

-   \[ \] El jugador puede hacer click en celdas vacías para colocar
    vías

-   \[ \] Cada celda de vía cuesta \$100

-   \[ \] Las vías no pueden colocarse sobre edificios existentes

-   \[ \] El sistema muestra el costo total antes de confirmar

-   \[ \] Las vías se renderizan con textura diferente a terreno vacío

-   \[ \] Las vías son necesarias para calcular rutas (HU-012)

**Prioridad:** Alta\
**Dependencias:** HU-001

**HU-010: Eliminar Edificios y Vías**

**Como** jugador\
**Quiero** demoler edificios y vías\
**Para** reorganizar mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema muestra opción \"Demoler\" en menú

-   \[ \] Al seleccionar demoler, el cursor cambia a modo demolición

-   \[ \] Al hacer click en un edificio/vía:

    -   Se muestra confirmación \"¿Demoler \[nombre\]?\"

    -   Se informa si hay ciudadanos afectados (en edificios
        residenciales)

-   \[ \] Al confirmar demolición:

    -   Se recupera 50% del costo de construcción

    -   Se elimina el edificio/vía del mapa

    -   Los ciudadanos afectados quedan sin hogar/empleo

    -   Se actualizan recursos de producción/consumo

-   \[ \] Se muestra notificación con dinero recuperado

**Prioridad:** Media\
**Dependencias:** HU-003, HU-004, HU-005, HU-009

**HU-011: Ver Información de Edificio**

**Como** jugador\
**Quiero** hacer click en un edificio para ver su información\
**Para** conocer sus estadísticas y estado actual

**Criterios de Aceptación:**

-   \[ \] Al hacer click en un edificio, se muestra panel lateral/modal
    con:

    -   Tipo y nombre del edificio

    -   Costo de construcción

    -   Costo de mantenimiento/turno

    -   Recursos que consume

    -   Recursos que produce

    -   Capacidad (vivienda/empleos)

    -   Ocupación actual

-   \[ \] Para edificios residenciales:

    -   Número de Ciudadanos viviendo actualmente

    -   Nivel de felicidad promedio

-   \[ \] Para edificios comerciales/industriales:

    -   Empleados actuales

-   \[ \] El panel incluye botón \"Demoler\" con confirmación

-   \[ \] El panel se cierra al hacer click fuera o en botón cerrar

**Prioridad:** Media\
**Dependencias:** HU-003, HU-004, HU-005, HU-006

**HU-012: Calcular Ruta Óptima entre Edificios**

**Como** jugador\
**Quiero** calcular la ruta más corta entre dos edificios\
**Para** planificar el transporte en mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema muestra botón \"Calcular Ruta\" en la interfaz

-   \[ \] Al activar, el jugador selecciona:

    1.  Edificio de origen (click en el mapa)

    2.  Edificio de destino (click en el mapa)

-   \[ \] El sistema construye matriz del mapa donde:

    -   0 = celda no transitable (edificios, terreno vacío)

    -   1 = celda transitable (vías)

-   \[ \] El sistema llama al backend: POST /api/calculate-route con:

-   { \"map\": \[\[0,1,1,\...\], \...\], \"origin\": {\"x\": 2, \"y\":
    3}, \"destination\": {\"x\": 10, \"y\": 15}}

-   \[ \] El sistema muestra loader mientras espera respuesta

-   \[ \] Al recibir respuesta del backend:

    -   Se anima la ruta en el mapa (resaltar celdas)

-   \[ \] Si no existe ruta, se muestra mensaje: \"No hay ruta
    disponible entre estos edificios\"

-   \[ \] El sistema permite calcular nueva ruta o cancelar

-   \[ \] La ruta se limpia al hacer nueva acción

**Prioridad:** Alta\
**Dependencias:** HU-009, Backend de Dijkstra

**HU-013: Sistema de Gestión de Ciudadanos**

**Como** jugador\
**Quiero** que los ciudadanos se asignen automáticamente a edificios\
**Para** ver mi ciudad poblarse dinámicamente

**Criterios de Aceptación:**

-   \[ \] Los ciudadanos se crean automáticamente cuando:

    -   Hay viviendas disponibles (edificios residenciales con
        capacidad)

    -   La felicidad promedio de la ciudad \> 60

    -   Hay empleos disponibles (edificios comerciales/industriales)

-   \[ \] Cada turno, el sistema:

    -   Verifica capacidad de vivienda disponible

    -   Crea nuevos ciudadanos (1-3 por turno si hay espacio) este valor
        puede ser configurable

    -   Asigna ciudadanos sin hogar a viviendas disponibles

    -   Asigna ciudadanos desempleados a trabajos disponibles

-   \[ \] Cada ciudadano tiene propiedades:

    -   ID único

    -   Nivel de felicidad (0-100)

-   \[ \] El sistema calcula felicidad individual basándose en:

    -   Tiene vivienda: +20

    -   Tiene empleo: +15

    -   Servicios: +10 por servicio (policía, bomberos, hospital) en
        toda la ciudad

    -   Parques: +5 por parque

-   \[ \] El sistema muestra estadísticas de población:

    -   Total de ciudadanos

    -   Empleados / Desempleados

    -   Felicidad promedio

**Prioridad:** Alta\
**Dependencias:** HU-003, HU-004, HU-005, HU-006

**HU-014: Gestión Automática de Recursos por Turno**

**Como** jugador\
**Quiero** que los recursos se actualicen automáticamente cada turno\
**Para** ver la evolución dinámica de mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema ejecuta un ciclo de actualización cada 10 segundos
    (1 turno)

-   \[ \] En cada turno, el sistema:

    1.  Calcula producción de recursos:

        -   Dinero: suma de ingresos de edificios comerciales e
            industriales

        -   Electricidad: suma de producción de plantas eléctricas

        -   Agua: suma de producción de plantas de agua

        -   Alimentos: suma de producción de granjas

    2.  Calcula consumo de recursos:

        -   Suma consumo de todos los edificios activos

    3.  Aplica balance: recurso += producción - consumo

    4.  Aplica costos de mantenimiento de edificios

    5.  Actualiza felicidad de ciudadanos

    6.  Procesa crecimiento de población

    7.  Procesa migraciones (si aplica)

    8.  Actualiza puntuación

-   \[ \] El sistema muestra notificación si algún recurso llega a 0:

    -   \"¡Alerta! Te has quedado sin \[recurso\]\"

    -   Consecuencias (ej: edificios dejan de funcionar)

**Prioridad:** Alta\
**Dependencias:** HU-001, HU-007, HU-013

**HU-015: Visualizar Panel de Recursos**

**Como** jugador\
**Quiero** ver mis recursos actuales en tiempo real\
**Para** tomar decisiones informadas sobre construcción

**Criterios de Aceptación:**

-   \[ \] El sistema muestra panel fijo en la interfaz con:

    -   **Dinero**: \$XX,XXX (verde si \> \$10,000, amarillo si \<
        \$5,000, rojo si \< \$1,000)

    -   **Electricidad**: XXX / XXX unidades (producción/consumo)

    -   **Agua**: XXX / XXX unidades (producción/consumo)

    -   **Alimentos**: XXX unidades

    -   **Población**: XXX ciudadanos

    -   **Felicidad promedio**: XX%

-   \[ \] El panel se actualiza automáticamente cada turno

-   \[ \] Al hacer hover sobre un recurso, se muestra tooltip con:

    -   Producción detallada

    -   Consumo detallado

    -   Balance neto

-   \[ \] El panel es responsive (se adapta a móvil/tablet/desktop)

**Prioridad:** Alta\
**Dependencias:** HU-014

**HU-016: Integración con API del Clima**

**Como** jugador\
**Quiero** ver el clima actual de mi región\
**Para** tener una experiencia más inmersiva

**Criterios de Aceptación:**

-   \[ \] El sistema llama a OpenWeatherMap API al cargar la ciudad:

-   GET
    https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}

-   \[ \] El sistema muestra widget de clima con:

    -   Temperatura actual (°C)

    -   Condición (soleado, lluvioso, nublado, tormenta)

    -   Icono animado del clima

    -   Humedad

    -   Velocidad del viento

-   \[ \] El clima se actualiza cada 30 minutos

**Prioridad:** Media\
**Dependencias:** HU-001, HU-014

**HU-017: Integración con API de Noticias**

**Como** jugador\
**Quiero** ver noticias de mi región\
**Para** sentir que mi ciudad está conectada con el mundo real

**Criterios de Aceptación:**

-   \[ \] El sistema llama a NewsAPI al cargar la ciudad:

-   GET https://newsapi.org/v2/top-headlines?country={code}&apiKey={key}

-   \[ \] El sistema muestra panel de noticias con:

    -   Últimas 5 noticias de la región

    -   Título de la noticia

    -   Descripción breve (2-3 líneas)

    -   Imagen (si disponible)

    -   Enlace a noticia completa

    -   Timestamp

-   \[ \] Las noticias se actualizan cada 30 minutos

**Prioridad:** Baja\
**Dependencias:** HU-001

**HU-018: Cálculo y Visualización de Puntuación**

**Como** jugador\
**Quiero** ver mi puntuación en tiempo real\
**Para** saber qué tan bien estoy gestionando mi ciudad

**Criterios de Aceptación:**

-   \[ \] El sistema calcula puntuación cada turno con la fórmula:

-   score = (population \* 10) + (happiness\_avg \* 5) + (money / 100) +
    (num\_buildings \* 50) + (electricity\_balance \* 2) +
    (water\_balance \* 2) + bonuses - penalties

-   \[ \] Bonificaciones:

    -   Todos los ciudadanos empleados: +500

    -   Felicidad \> 80: +300

    -   Recursos todos positivos: +200

    -   Ciudad \> 1000 habitantes: +1000

-   \[ \] Penalizaciones:

    -   Dinero negativo: -500

    -   Electricidad negativa: -300

    -   Agua negativa: -300

    -   Felicidad \< 40: -400

    -   Ciudadanos desempleados: -10 por ciudadano

-   \[ \] El sistema muestra puntuación en panel principal

-   \[ \] El sistema muestra desglose de puntuación:

    -   Puntos por población

    -   Puntos por felicidad

    -   Puntos por edificios

    -   Puntos por recursos

    -   Bonificaciones

    -   Penalizaciones

    -   **Total**

-   \[ \] La puntuación se guarda en cada turno para ranking

**Prioridad:** Media\
**Dependencias:** HU-014, HU-015

**HU-019: Sistema de Ranking Local**

**Como** jugador\
**Quiero** ver un ranking de las mejores ciudades\
**Para** comparar mi desempeño con otras partidas

**Criterios de Aceptación:**

-   \[ \] El sistema guarda automáticamente el puntaje en LocalStorage:

-   { \"ranking\": \[ { \"cityName\": \"Nueva Ciudad\", \"mayor\":
    \"Juan Pérez\", \"score\": 15420, \"population\": 1250,
    \"happiness\": 78, \"turns\": 145, \"date\":
    \"2025-01-27T10:30:00Z\" } \]}

-   \[ \] El ranking se ordena por puntuación (descendente)

-   \[ \] El sistema muestra modal/página de ranking con:

    -   Top 10 ciudades

    -   Posición (\#1, \#2, \#3, etc.)

    -   Nombre de ciudad

    -   Alcalde

    -   Puntuación

    -   Población

    -   Felicidad promedio

    -   Número de turnos jugados

    -   Fecha

-   \[ \] La ciudad actual del jugador se resalta en el ranking

-   \[ \] Si no está en top 10, se muestra abajo: \"Tu ciudad: \#XX\"

-   \[ \] El sistema permite:

    -   Reiniciar ranking (con confirmación)

    -   Exportar ranking a JSON

-   \[ \] El ranking persiste entre sesiones (LocalStorage)

**Prioridad:** Media\
**Dependencias:** HU-019

**HU-020: Guardar y Cargar Partida**

**Como** jugador\
**Quiero** que mi progreso se guarde automáticamente\
**Para** poder continuar mi partida más tarde

**Criterios de Aceptación:**

-   \[ \] El sistema guarda automáticamente en LocalStorage cada 30
    segundos

-   \[ \] El sistema guarda:

    -   Estado completo de la ciudad (nombre, alcalde, coordenadas)

    -   Matriz del mapa con todos los edificios y vías

    -   Estado de todos los recursos

    -   Lista de ciudadanos con sus propiedades

    -   Turno actual

    -   Puntuación actual

    -   Histórico de recursos (últimos 20 turnos para gráficos)

-   \[ \] Al cargar la aplicación, el sistema:

    -   Detecta si hay partida guardada

    -   Muestra mensaje: \"¿Deseas continuar tu partida anterior?\"

    -   Opciones: \"Continuar\" o \"Nueva Ciudad\"

-   \[ \] Si el jugador elige \"Continuar\":

    -   Se carga el estado completo desde LocalStorage

    -   Se reconstruyen todas las instancias de objetos

    -   Se restaura la interfaz al estado guardado

    -   El ciclo de turnos continúa desde donde se dejó

-   \[ \] El sistema muestra indicador \"Guardando\...\" al guardar

-   \[ \] El sistema permite:

    -   Guardar manualmente (botón \"Guardar Partida\")

    -   Eliminar partida guardada (con confirmación)

**Prioridad:** Alta\
**Dependencias:** HU-001, HU-014

**HU-021: Exportar Estado de Ciudad a JSON**

**Como** jugador\
**Quiero** exportar mi ciudad a un archivo JSON\
**Para** compartirla o crear respaldos

**Criterios de Aceptación:**

-   \[ \] El sistema muestra opción \"Exportar Ciudad\" en menú

-   \[ \] Al hacer click, el sistema genera archivo JSON con:

-   { \"cityName\": \"\...\", \"mayor\": \"\...\", \"gridSize\":
    {\"width\": 20, \"height\": 20}, \"coordinates\": {\"lat\": 4.6097,
    \"lon\": -74.0817}, \"turn\": 145, \"score\": 8920, \"map\":
    \[\[\...\], \[\...\], \...\], \"buildings\": \[{\...}, {\...}\],
    \"roads\": \[{\...}, {\...}\], \"resources\": {\...}, \"citizens\":
    \[{\...}, {\...}\], \"population\": 450, \"happiness\": 75}

-   \[ \] El archivo se descarga con nombre:
    ciudad\_{nombre}\_{fecha}.json

-   \[ \] El sistema muestra notificación de éxito al exportar

-   \[ \] El JSON exportado puede ser reimportado (HU-002)

-   \[ \] El formato es legible (pretty-print con indentación)

**Prioridad:** Baja\
**Dependencias:** HU-021

**HU-022: Diseño Responsive - Vista Móvil**

**Como** jugador en dispositivo móvil\
**Quiero** que la interfaz se adapte a mi pantalla\
**Para** poder jugar cómodamente desde mi teléfono

**Criterios de Aceptación:**

-   \[ \] En resoluciones \< 768px:

    -   El mapa ocupa el 100% del ancho de la pantalla

    -   Los paneles se organizan verticalmente

    -   El menú de construcción se muestra como tabs en la parte
        inferior

    -   El panel de recursos se muestra como header colapsable

    -   Las estadísticas se acceden mediante botón flotante

-   \[ \] Controles táctiles optimizados:

    -   Botones de al menos 44x44px (target táctil mínimo)

    -   Tap en edificio para seleccionar

    -   Tap en celda vacía para construir

    -   Swipe horizontal para scroll del menú de edificios

-   \[ \] El mapa es scrollable vertical y horizontalmente

-   \[ \] Zoom mediante pinch (dos dedos)

-   \[ \] El modal de información de edificio ocupa 80% de la pantalla

-   \[ \] Las notificaciones se muestran en la parte superior

-   \[ \] El widget de clima es compacto (icono + temperatura)

-   \[ \] Las noticias se muestran en carrusel horizontal

**Prioridad:** Alta\
**Dependencias:** Todas las HUs de funcionalidad

**HU-023: Diseño Responsive - Vista Tablet**

**Como** jugador en tablet\
**Quiero** una interfaz optimizada para pantalla mediana\
**Para** aprovechar el espacio disponible

**Criterios de Aceptación:**

-   \[ \] En resoluciones 768px - 1024px:

    -   Layout en dos columnas: mapa (70%) + sidebar (30%)

    -   El mapa muestra grid completo sin scroll horizontal

    -   Panel de recursos en sidebar superior

    -   Menú de construcción en sidebar central

    -   Estadísticas en sidebar inferior

    -   Widget de clima y noticias en tabs laterales

-   \[ \] Soporte para orientación vertical y horizontal

-   \[ \] En horizontal: layout optimizado con sidebars izquierdo y
    derecho

-   \[ \] En vertical: similar a móvil pero con más espacio

-   \[ \] Tooltips más grandes al hacer hover

-   \[ \] Modales ocupan 60% de la pantalla

-   \[ \] Botones de tamaño medium (adecuados para touch)

**Prioridad:** Media\
**Dependencias:** HU-023

**HU-024: Diseño Responsive - Vista Desktop**

**Como** jugador en computadora de escritorio\
**Quiero** una interfaz completa con todos los paneles visibles\
**Para** gestionar mi ciudad eficientemente

**Criterios de Aceptación:**

-   \[ \] En resoluciones \> 1024px:

    -   Layout en tres secciones: sidebar izquierdo, mapa central,
        sidebar derecho

    -   **Sidebar izquierdo** (250px):

        -   Panel de recursos

        -   Menú de construcción

    -   **Mapa central** (flexible):

        -   Grid completo visible

        -   Controles de zoom (+/-)

    -   **Sidebar derecho** (300px):

        -   Widget de clima

        -   Panel de noticias

        -   Estadísticas resumidas

-   \[ \] Hover effects en todos los elementos interactivos

-   \[ \] Tooltips informativos al hacer hover en edificios

-   \[ \] Cursor personalizado en modo construcción

-   \[ \] Atajos de teclado:

    -   B: Abrir menú de construcción

    -   R: Modo construcción de vías

    -   D: Modo demolición

    -   ESC: Cancelar modo actual

    -   Space: Pausar/Reanudar

    -   S: Guardar partida

-   \[ \] Modales centrados (50% max-width)

-   \[ \] Animaciones suaves en transiciones

**Prioridad:** Alta\
**Dependencias:** HU-023, HU-024

**Consideración Final: Solo se puede utilizar html, css y javascript
puro, está totalmente prohibido que dentro de un archivo html esté
incluido código css o javascript, deben estar totalmente separados, por
cada hallazgo de incumplimiento serán -0.5 décimas de la nota del
proyecto**
