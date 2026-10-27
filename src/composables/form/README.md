# Formularios basados en esquema

Importar useFormDetail desde ./detail/useFormDetail o useFormList desde ./list/useFormList. Ambos componen useFormBase; dependencies.ts contiene reglas puras y transport.ts adapta HTTP y respuestas. Copiar esta carpeta y FormComponent.vue al proyecto real, ajustando sus imports.

El listado usa lista.json. useFormDetail extrae data.groups[].fields. useFormList extrae config.columns y expone editRow(index) y createRow(). initForm preserva selecciones al hidratar; reset recupera la instantanea; getPayload devuelve una copia. Los combos simples normalizan [421] a 421.

Las opciones se cargan al abrir el desplegable; loadCombos permite precargarlas. Cambiar dependencias limpia descendientes inmediatamente y recarga opciones en el siguiente ciclo Vue. Las peticiones se cancelan al invalidar y al desmontar; se descartan respuestas antiguas aunque el transporte ignore abort.

## Contrato de dependencias

parent: 'id_country' envia data.parent = model.id_country. waitparent o combowaitparent impide cargar hasta que exista ese valor; 0 y false cuentan como valores.

sourcedest: [{ source: 'id_country', destination: 'pais' }] envia data.pais = model.id_country y reinicia el campo que contiene ese mapeo cuando cambia id_country. Se conserva el resto del data configurado. sourcedestsetter copia propiedades de la opcion seleccionada hacia campos del modelo. Los ejemplos contienen mapeos de literales como country_name; no se reinterpretan como IDs.

## Integracion HTTP

Pasar { transport: async (action, signal) => ... } para usar el cliente HTTP del proyecto. El transporte incluido hace POST a action.url con { config, data }; sourcedest es metadato local y no se envia. parseOptions acepta arrays o { data: [] }, con objetos { id, name/text/label } o filas [{ id, value }]. Ajustar este adaptador si el servidor real devuelve otra estructura.

Las vistas muestran el payload tras validar; no ejecutan actionUpdate porque falta el contrato de guardado real. Las URLs relativas requieren el backend o proxy del proyecto real. Los fallos aparecen por combo. FormComponent ofrece el slot field para LISTDIALOG, LISTREL, GEOMETRY y otros controles especializados. No implementa todos los metadatos visuales de los JSON.

## Verificacion

npm run type-check
npx vitest run src/composables/form/useFormBase.spec.ts
npm run build-only

## Avisos de formato

La logica esta en useFormValidation.ts y su presentacion en FormComponent.vue. Configurar validation.rules: [{ type: 'regex', pattern: '^A', severity: 'warning', message: 'Debe empezar por A mayuscula.', trigger: 'blur' }]. El aviso aparece al salir del campo (o al enviar); usar trigger: 'change' para validar al escribir. Los warnings usan el-text type="warning" debajo del control y permiten enviar. severity: 'error' bloquea el envio. required y nospaces producen errores. Los campos opcionales vacios no generan avisos de formato; las regex invalidas se rechazan como errores de configuracion. Restablecer o hidratar reinicia el estado de interaccion.
