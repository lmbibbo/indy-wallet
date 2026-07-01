# Reglas del Negocio — indy Wallet

## Visión General

indy es una billetera virtual con interés compuesto diario e integración con cuentas de trading MetaTrader 4 (MT4). Los usuarios depositan fondos y pueden transferirlos a un **Fondo Común de Inversión** global. El fondo tiene una **estrategia única** (Conservador, Moderado o Agresivo) definida por un administrador. Cada usuario posee un **% de participación** sobre el valor total del fondo. Cuando el fondo genera rendimientos (simulados por día), se distribuyen proporcionalmente. Todas las operaciones se registran como **eventos inmutables** en un ledger (event sourcing) — no hay snapshots. El usuario puede visualizar proyecciones de crecimiento, historial de transacciones y estado de MT4.

### Mapa de Conceptos y Relaciones

| Concepto | Descripción | Se relaciona con |
|---|---|---|
| **Saldo disponible** | Saldo del usuario almacenado en DB (`balance`). Es dinero no invertido, disponible para retiro o inversión. | Se deposita desde fuera del sistema. Se retira a una cuenta externa. Se transfiere al **Fondo Común de Inversión**. |
| **Fondo Común de Inversión** | Pool global de dinero de todos los usuarios que invierten. Tiene una **estrategia de inversión** única que define su rendimiento. El dinero se envía a MT4 para operar. | Recibe transferencias desde **Saldo disponible** de cada usuario. Genera rendimientos según su **Estrategia de inversión**. Se retira dinero proporcionalmente al % de cada usuario. |
| **Estrategia de inversión** | Tasa de rendimiento del Fondo Común (Conservador, Moderado o Agresivo). Es única para todo el fondo, no por usuario. | La define un administrador. Determina el interés que genera el **Fondo Común** diariamente. |
| **% de participación** | Porcentaje del Fondo Común que pertenece a cada usuario. Se calcula como `(totalInvertidoPorUsuario / totalDelFondo) * 100`. | Determina cuánto recibe un usuario al retirar. Se actualiza cada vez que alguien invierte o retira. |
| **Inversión en el mercado** | Acción de transferir dinero desde el **Saldo disponible** al **Fondo Común de Inversión**. | Aumenta el % de participación del usuario. Disminuye su saldo disponible. |
| **Retiro de inversión** | Acción de sacar dinero del **Fondo Común de Inversión** y devolverlo al **Saldo disponible** del usuario. | Disminuye el % de participación del usuario. El monto retirado se calcula como `%DelUsuario * valorActualDelFondo`. |

---

## Casos de Uso

### 1. Autenticación

| Campo | Detalle |
|---|---|
| **Actor** | Usuario no autenticado |
| **Descripción** | El usuario se registra o inicia sesión con email y contraseña vía Firebase Auth. |
| **Flujo** | 1. Ingresa email y contraseña. 2. El sistema autentica contra Firebase. 3. Redirige al dashboard. |
| **Alternativo** | Si olvida la contraseña, puede solicitar un correo de restablecimiento. |

### 2. Ver Saldo Disponible

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza su saldo actual en la billetera (almacenado en DB local). |
| **Regla** | El saldo disponible es independiente del saldo de MT4. Refleja únicamente los fondos registrados en la base de datos local. |

### 3. Depositar Fondos

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario incrementa su saldo disponible mediante un depósito. |
| **Precondición** | Monto > 0. |
| **Postcondición** | El saldo disponible aumenta en el monto indicado. Se registra una transacción de tipo "deposit". |

### 4. Retirar Fondos (a saldo disponible)

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario disminuye su saldo disponible. |
| **Precondición** | Monto > 0 y monto <= saldo disponible. |
| **Postcondición** | El saldo disponible disminuye en el monto indicado. Se registra una transacción de tipo "withdraw". |

### 5. Invertir en el Mercado

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario transfiere fondos desde su saldo disponible al **Fondo Común de Inversión**. El dinero se agrupa con el de otros usuarios y se envía a MT4. |
| **Precondición** | Monto > 0, monto <= saldo disponible. |
| **Postcondición** | El saldo disponible disminuye. El **Fondo Común** aumenta. Se recalcula el **% de participación** de cada usuario en el fondo. Se crea un registro de inversión. |
| **Regla** | El sistema debe mantener actualizado el % que cada usuario posee del Fondo Común. El cálculo es: `% = (totalInvertidoPorUsuario / totalDelFondo) * 100`. La estrategia de rendimiento la define el Fondo Común, no el usuario. |

### 6. Retirar Inversión

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario retira fondos del **Fondo Común de Inversión** y los devuelve a su saldo disponible. |
| **Precondición** | `% de participación` del usuario > 0. |
| **Postcondición** | El saldo disponible aumenta según el **% de participación** del usuario sobre el valor actual del Fondo Común. Se decrementa el Fondo Común en ese monto. Se recalcula el **% de participación** de todos los usuarios. Se registra una transacción. |
| **Regla** | El monto a retirar se calcula como: `montoRetiro = porcentajeDelUsuario * valorActualDelFondo`. Si retira parcialmente, se reduce su % proporcionalmente. Si retira el total, su % pasa a 0. No se retira el `investedAmount` nominal sino la parte proporcional del valor actual del fondo. |

### 7. Cambiar Estrategia del Fondo

| Campo | Detalle |
|---|---|
| **Actor** | Administrador (`ROLE_ADMIN`) |
| **Descripción** | El administrador cambia la estrategia de rendimiento del **Fondo Común**. Aplica a todos los usuarios por igual. |
| **Regla** | La estrategia del Fondo Común define la tasa de interés diaria que genera el pool. Todos los usuarios comparten la misma tasa. |
| **Estrategias** | **Conservador** (70% TNA, riesgo bajo), **Moderado** (95% TNA, riesgo medio), **Agresivo** (140% TNA, riesgo alto). |

### 8. Simular un Día

| Campo | Detalle |
|---|---|
| **Actor** | Administrador (`ROLE_ADMIN`) |
| **Descripción** | El administrador avanza la simulación un día para todo el sistema. |
| **Postcondición** | Se aplica exactamente **1 evento de interés** compuesto sobre el valor total del pool usando la tasa de la **estrategia del Fondo Común**. El rendimiento generado se distribuye entre los usuarios según su **% de participación**. Se emiten eventos inmutables: uno global de tipo `pool_interest` y uno por usuario de tipo `interest`. El estado actual del sistema se calcula siempre reprocesando la serie de eventos desde el origen. |
| **Regla** | La frecuencia de cálculo del interés es de **1 vez por día simulado**. Cada ejecución de "Simular un Día" genera exactamente un ciclo de interés. |

### 9. Simulación Rápida (Auto)

| Campo | Detalle |
|---|---|
| **Actor** | Administrador |
| **Descripción** | El administrador activa una simulación automática que avanza 1 día cada 600 ms. |
| **Regla** | Solo visible para usuarios con rol ADMIN. |

### 10. Ver Proyección de Crecimiento

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza en un gráfico la proyección de su saldo en un horizonte de días seleccionable (10 a 365 días). |
| **Regla** | La proyección se calcula en base a la **estrategia del Fondo Común** y la **participación actual del usuario**, aplicando la tasa diaria proyectada sobre el valor futuro estimado del fondo. |

### 11. Ver Actividad de Cuenta

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza el historial de transacciones (depósitos, retiros, intereses). |
| **Regla** | Las transacciones se muestran ordenadas por ID descendente. |

### 12. Ver Estado de MT4

| Campo | Detalle |
|---|---|
| **Actor** | Usuario autenticado |
| **Descripción** | El usuario visualiza el estado de conexión con MetaTrader 4 y los detalles de la cuenta (Equity, Profit, Margen). |
| **Regla** | El balance de MT4 se muestra en "Valor Actual" de inversiones. Es independiente del saldo disponible de la billetera. Se muestra además la diferencia entre Valor Actual y Monto Invertido. |

---

## Modelo de Datos

### FondoComun

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Long (PK) | ID del fondo (único, un solo registro global) |
| `totalValue` | double | Valor total actual del fondo común |
| `strategy` | String | Estrategia activa del fondo (conservative, moderate, aggressive) |
| `lastUpdated` | String | Timestamp de última actualización |

### Participation (por usuario)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Long (PK) | ID autoincremental |
| `uid` | String | ID del usuario |
| `fundId` | Long | FK al FondoComun |
| `percentage` | double | % de participación del usuario en el fondo (0-100) |
| `investedAmount` | double | Monto nominal que el usuario aportó originalmente |

### WalletState (Entidad Principal)

| Campo | Tipo | Descripción |
|---|---|---|
| `uid` | String (PK) | ID del usuario (Firebase UID) |
| `balance` | double | Saldo disponible en la billetera (no invertido) |
| `totalEarnings` | double | Ganancias totales acumuladas |
| `todayEarnings` | double | Ganancias del día actual |
| `simulatedDaysCount` | int | Días simulados |

### Event (Ledger inmutable)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | Long (PK) | ID autoincremental |
| `uid` | String | ID del usuario (nullable para eventos globales del pool) |
| `type` | String | deposit, withdraw, interest, pool_interest, invest, disinvest |
| `amount` | double | Monto del evento |
| `fundTotalAfter` | double | Valor total del Fondo Común después del evento |
| `userBalanceAfter` | double | Saldo disponible del usuario después del evento |
| `userPercentageAfter` | double | % de participación del usuario después del evento |
| `day` | int | Día simulado en que ocurrió el evento |
| `timestamp` | String | Timestamp real |

> El estado actual de cualquier entidad se obtiene siempre reprocesando la serie de eventos desde el origen (event sourcing). No existen snapshots de balance — el ledger es la única fuente de verdad.

---

## Reglas Transversales

1. **Persistencia**: Todos los balances y estados se persisten en PostgreSQL.
2. **Autenticación**: Toda operación requiere un token JWT válido de Firebase Auth.
3. **MT4**: La conexión con MetaTrader es optativa. Si está disponible, el rendimiento diario del Fondo Común se calcula a partir del **profit real de las órdenes cerradas** vía `/v1/history/orders`. Si no está disponible, se usa la **simulación por estrategia** (tasa diaria según Conservador/Moderado/Agresivo).
4. **Event Sourcing**: No existen snapshots de balance. Cada modificación de estado (depósito, retiro, inversión, interés) se registra como un **evento inmutable** en el ledger. El estado actual de cualquier entidad (saldo del usuario, valor del fondo, % de participación) se calcula reprocesando la serie de eventos desde el origen. La ganancia periódica se obtiene consultando los eventos de tipo `interest` y `pool_interest` en un rango de días.
5. **Rendimiento Diario**: Cada día simulado se intenta obtener el profit real desde MT4 (`/v1/history/orders`). Si MT4 responde con órdenes cerradas, se suma el `PROFIT` de todas las órdenes del día y ese monto se aplica al Fondo Común. Si no hay datos de MT4, se usa la **tasa de la estrategia del fondo** como fallback. El rendimiento se distribuye entre los usuarios según su **% de participación**. Se emite un evento `pool_interest` global y eventos `interest` por usuario.
6. **Fondo Común**: Todo el dinero invertido por los usuarios se agrupa en un único Fondo Común global con una **estrategia única**. No existe el concepto de "inversión individual" — cada usuario posee un **% de participación** sobre el valor total del fondo.
7. **Actualización de %**: Cada vez que un usuario invierte o retira, se debe recalcular el % de participación de **todos** los usuarios del fondo para mantener la consistencia.
8. **Estrategia centralizada**: La estrategia de inversión se define a nivel del Fondo Común, no por usuario. Todos los inversores comparten la misma tasa de rendimiento. Solo un administrador puede cambiarla.
9. **Valor del Fondo vs. Saldo Individual**: El valor del Fondo Común puede crecer (por rendimientos de MT4) o decrecer (por pérdidas). El usuario no retira su monto nominal original, sino la fracción correspondiente a su % del valor actual del fondo.
